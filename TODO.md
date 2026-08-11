# TODO

The maintainer's informal idea list — smaller than the [roadmap](./ROADMAP.md),
rougher than an issue. Nothing here is a commitment; items graduate to the in-app
**Features** board (or a GitHub issue) when they're ready to be built.

## Ideas

- **Better artifact hosting** — multi-file / bundled SPAs behind the same public
  page URL, and a one-call "publish this HTML" helper over MCP.
- **Image generation** — generate images through OpenRouter and save the result
  straight into Files or an artifact.
- **Reindex** — an on-demand way to rebuild the knowledge base for a document or
  the whole workspace after a chunking or embedding change.
- **Public read for tables** — a curated, published view or aggregate, so a table
  can be read publicly without exposing everyone's rows.
- **Release SHA in the footer** — so it's obvious which build is live.
- **More forged-function examples** — a calculator, an OCR-before-AI PDF step, an
  HTML-to-markdown parser. Each becomes an API or a step in a larger process.

## A worked example worth building around

Deterministic and non-deterministic steps chained together:

1. An opt-out email arrives in the inbox.
2. An agent parses the unstructured message into structured fields.
3. A deterministic tool call writes those fields into a table — no model in that
   step, so the write is predictable and auditable.

The pieces all exist (inbox routing, listeners, direct tool runs); this is about
making it a documented, repeatable pattern rather than a bespoke setup.

## Testing a webhook

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/webhook/<token>' -H 'Content-Type: application/json' -d '{"expression":"2 + 2 * 10"}'
```
