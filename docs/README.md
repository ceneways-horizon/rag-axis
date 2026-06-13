# docs/

Documentation for rag-axis, organized into two folders plus the public documentation site at the project root.

| Folder | Audience | Tool | Purpose |
|---|---|---|---|
| `shared/` | Both | Source of truth | Invariants, architecture, glossary, never duplicated |
| `internal/` | Team only | MkDocs | ADRs, contracts, stubs, checklists, debug guides |
| `docs/` (this directory) | External users | Docusaurus | Getting started, concepts, API reference, guides, examples |

---

## Running Internal Docs (MkDocs)

```bash
pip install mkdocs mkdocs-material
mkdocs serve -f docs/internal/mkdocs.yml
```

Opens at **http://127.0.0.1:8000**

The site includes `internal/` and `shared/` only. The public documentation site is never included.

---

## Running Public Docs (Docusaurus)

The public documentation site is a Docusaurus project rooted at `docs/`, with its content under `docs/docs/`.

```bash
cd docs
npm install
npm run start
```

Opens at **http://localhost:3000**

To build the static site:

```bash
cd docs
npm run build
```

The output is written to `docs/build/`.

---

## Shared Content

`docs/shared/` is the single source of truth for:

- **invariants.md**, I1-I7 definitions
- **architecture.md**, the three-layer model
- **packages.md**, package responsibility matrix
- **philosophy.md**, design principles
- **glossary.md**, authoritative term definitions

Both internal and public docs cross-link to shared content.
Never copy-paste from shared/, link to it instead.

---

## Deployment

The public documentation site deploys to Vercel, configured via `docs/vercel.json`. The Vercel project root directory is set to `docs`, and the site is hosted at `ragaxis.cenewayshorizon.com`.
