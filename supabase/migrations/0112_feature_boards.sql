-- Multi-repo Features boards: run the idea → approve → PR → merge flow for
-- several GitHub repositories at once.
--
-- The board (0048) was bound to ONE repo via the `GITHUB_REPO` env var. A
-- `feature_boards` row now names a board and the repo it targets, and
-- `features.board_id` says which board a card lives on.
--
-- BACK-COMPAT IS THE POINT: `board_id is null` means the implicit "default
-- board", whose repo stays the `GITHUB_REPO` env var exactly as before. A
-- workspace with zero `feature_boards` rows looks and behaves identically to
-- the single-board page, so this migration changes nothing until an admin
-- creates a board.

create table if not exists public.feature_boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- `owner/name`. Validated here as well as in the edge function because the
  -- value is interpolated into GitHub REST paths.
  repo text not null check (repo ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feature_boards enable row level security;

-- RLS mirrors `features`: the board list is workspace-visible (a member needs
-- to see which board a card is on), but creating/renaming/deleting a board
-- points AI effort at a repository, so it stays admin-only.
drop policy if exists "Members read feature boards" on public.feature_boards;
create policy "Members read feature boards"
  on public.feature_boards for select
  using (auth.uid() is not null);

drop policy if exists "Admins insert feature boards" on public.feature_boards;
create policy "Admins insert feature boards"
  on public.feature_boards for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "Admins update feature boards" on public.feature_boards;
create policy "Admins update feature boards"
  on public.feature_boards for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "Admins delete feature boards" on public.feature_boards;
create policy "Admins delete feature boards"
  on public.feature_boards for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- `on delete set null`: deleting a board must never delete its cards — they
-- fall back to the default board, where an admin can re-file them.
alter table public.features
  add column if not exists board_id uuid references public.feature_boards (id) on delete set null;

create index if not exists features_board_id_idx on public.features (board_id);

-- Live board switcher: a newly created board should appear without a reload,
-- the same reason `features` joined the publication in 0061. Idempotent.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'feature_boards'
  ) then
    alter publication supabase_realtime add table public.feature_boards;
  end if;
end $$;
