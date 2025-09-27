# LucidSeal Assets (MVP)

[![Build Status](https://github.com/lucidseal/lucidseal-assets/actions/workflows/deploy-assets.yml/badge.svg)](https://github.com/lucidseal/lucidseal-assets/actions/workflows/deploy-assets.yml)
![Last Updated](https://img.shields.io/github/last-commit/lucidseal/lucidseal-assets/main?label=Last%20Updated)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/25ipx.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

This repository is the **source of truth** for LucidSeal’s public assets.  
Assets are automatically published to [https://assets.lucidseal.org](https://assets.lucidseal.org) for community use.

⚠️ Note: Removing a file from this repo does **not** remove it from R2 storage. Clean-up must be done manually by maintainers.

This repo is intended for both community users (as a source of public assets) and maintainers (who publish them).

---

## 📂 Structure

```

public/              → Assets published to assets.lucidseal.org
privacy/           → Privacy by Default (templates, notices)
transparency/      → Transparency in Action (glossary, guides)
security/          → Secure Foundations (checklists, registers)
community/         → Community First (escalation docs, surveys)
cross-principle/   → Combined assets (Trust Page, maturity checklist)
brand/             → Badge, logos, brand guide
templates/           → Drafts or working copies
src/worker.js        → Cloudflare Worker serving assets
.github/workflows/   → CI pipeline for publishing
wrangler.toml        → Worker configuration
publish-allowlist.txt→ Optional: include extra files outside public/

```

---

## 🚀 Workflow

1. **Add or update a file** under `public/`
2. **Commit & push to `main`**
3. **GitHub Action runs**:
   - Uploads all files under `public/` to the R2 bucket
   - Generates/updates `manifest.json`
4. Assets are live at:  
```

[https://assets.lucidseal.org/](https://assets.lucidseal.org/)<category>/<filename>

```

---

## 📜 Manifest

A machine-readable index of all public assets is served at:

```

[https://assets.lucidseal.org/manifest.json](https://assets.lucidseal.org/manifest.json)

```

Each entry includes:  
`path`, `title`, `category`, `mime`, `size`, `updated_at`.

---

## 🛡️ Security & Headers

The Cloudflare Worker ensures:
- Correct MIME type for each file  
- `Content-Disposition`: inline for PDFs/images, attachment for Office docs  
- Cache: 10m browser / 1d edge (manifest fresher: 1m/10m)  
- Security headers: `nosniff`, `no-referrer`, limited CORS (lucidseal.org only)  

---

## 🔧 Setup (for maintainers)

- **Cloudflare R2**: bucket `lucidseal-assets`  
- **Cloudflare Worker**: `src/worker.js`, deploy with `wrangler deploy`  
- **Route**: `assets.lucidseal.org/*` → Worker  
- **GitHub Secrets**:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET` = `lucidseal-assets`

---

## ✅ Example Assets

- Privacy Notice:  
  [privacy/privacy-notice-template.pdf](https://assets.lucidseal.org/privacy/privacy-notice-template.pdf)
- Risk Register Starter:  
  [security/risk-register-starter.xlsx](https://assets.lucidseal.org/security/risk-register-starter.xlsx)
- Trust Page (One-Pager):  
  [cross-principle/trust-page-template.pdf](https://assets.lucidseal.org/cross-principle/trust-page-template.pdf)

---

## 🔮 Future Enhancements

- Versioned URLs (`/v1/...`) and immutable hash paths (`/sha256/...`)  
- Auto-generate DOCX/PDF from Markdown templates (Pandoc in CI)  
- Optional public UI for browsing assets  
- Signed URLs for restricted or draft assets  

---

## 📖 License

All public assets in this repository are licensed under the  
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

You are free to:  
✔️ Share — copy and redistribute in any medium or format  
✔️ Adapt — remix, transform, and build upon the material  
for any purpose, even commercially.  

You must:  
✏️ Give appropriate credit and indicate if changes were made.

