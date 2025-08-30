# LucidSeal Assets (Docs & Guides)

This repository is the **source of truth** for LucidSeal documents (principles, guides, kits).  
Editable files live in `src/` (tracked with Git LFS). Distribution-ready **PDFs** are exported to `dist/` and **published to Cloudflare R2** via GitHub Actions.

## Workflow
1. Edit Word/PowerPoint in `src/...`
2. Export PDF to `dist/<category>/<slug>/<version>/<file>.pdf`
3. Update `manifest/index.json` (current version + URLs)
4. Commit → Tag (`docs-<slug>-<version>` or `guides-<slug>-<version>`)
5. CI publishes to R2 at `assets.lucidseal.org`

## Versioned & Stable URLs
- Versioned (immutable): `https://assets.lucidseal.org/docs/<slug>/<version>/<file>.pdf`
- Stable alias:          `https://assets.lucidseal.org/docs/<slug>/latest/<file>.pdf`

## Repo layout
src/                 # Editable docs (LFS)
dist/                # Exported PDFs (built artifacts)
manifest/index.json  # Machine-readable index (current & all versions)
.github/workflows/   # CI to publish to R2

## Secrets (in GitHub)
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY

## Local notes
- Use consistent slugs (e.g., `lucidseal-principles`, `board-briefing-kit`)
- PDFs should be optimized for web (150–200dpi is usually enough).
- Large binary files (`.docx/.pptx`) are tracked with Git LFS.
