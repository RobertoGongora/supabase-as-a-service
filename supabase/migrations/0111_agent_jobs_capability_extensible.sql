-- Extensible capability workers: the agent_jobs.capability value-list check
-- hard-coded office/media, so a self-hosted deployment could not register an
-- extra worker (a homelab "builder", a GPU box, …) without schema surgery —
-- contradicting docs/capability-workers.md's extensibility contract. Replace it
-- with a FORMAT check; the operation allow-list in code (CAPABILITY_OPERATIONS
-- + the AGENT_JOBS_EXTRA_CAPABILITIES env on the functions runtime) remains
-- the security gate, exactly as before.
alter table public.agent_jobs drop constraint if exists agent_jobs_capability_check;
alter table public.agent_jobs add constraint agent_jobs_capability_check
  check (capability ~ '^[a-z][a-z0-9_]{0,31}$');
