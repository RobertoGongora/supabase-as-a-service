# TODO

The maintainer's scratchpad: loose ideas that are not yet worth a spec. Anything
with a shape and a reason belongs in [ROADMAP.md](./ROADMAP.md) instead, and
anything already built is described in the [docs](./docs/README.md).

## Ideas

**Richer artifact hosting.** A shared HTML page is a single file today. Bundled,
multi-file pages served from the same link would make "here is the thing I built"
cover a lot more ground.

**Image generation.** Ask for an image in chat and get one back, saved as a file
like any other output.

**Reindex on demand.** A way to re-run knowledge indexing over a document — after a
better extractor lands, or when an early ingest went wrong.

**Version in the footer.** Show the deployed commit so it is obvious which build a
workspace is running.

## Functions worth forging

Deterministic work an LLM should not be doing by hand. Each becomes a tool, and
therefore a step in a larger process:

- a calculator,
- OCR for scanned PDFs before the text reaches a model,
- unit and format conversions.

The shape they enable, end to end: an opt-out email arrives → the assistant turns
unstructured text into structured fields → a function writes those fields somewhere
deterministic.

## Trying a webhook by hand

```bash
curl -X POST 'https://<your-project>.supabase.co/functions/v1/webhook/<token>' -H 'Content-Type: application/json' -d '{"expression":"2 + 2 * 10"}'
```
