# docs/

Documentation for rag-axis, organized into three folders.

| Folder | Audience | Tool | Purpose |
|---|---|---|---|
| `shared/` | Both | Source of truth | Invariants, architecture, glossary — never duplicated |
| `internal/` | Team only | MkDocs | ADRs, contracts, stubs, checklists, debug guides |
| `public/` | External users | Mintlify | Getting started, concepts, API reference, guides |

---

## Running Internal Docs (MkDocs)

```bash
pip install mkdocs mkdocs-material
mkdocs serve -f docs/internal/mkdocs.yml
```

Opens at **http://127.0.0.1:8000**

The site includes `internal/` and `shared/` only. `public/` is never included.

---

## Public Docs (Mintlify)

Public docs are in `docs/public/` and configured via `docs/public/mint.json`.

They deploy automatically on merge to `main` via Mintlify CI.

To preview locally:

```bash
npm i -g mintlify
mintlify dev --port 3000
```

---

## Shared Content

`docs/shared/` is the single source of truth for:

- **invariants.md** — I1-I7 definitions
- **architecture.md** — three-layer model
- **packages.md** — package responsibility matrix
- **philosophy.md** — design principles
- **glossary.md** — authoritative term definitions

Both internal and public docs **cross-link** to shared content.
Never copy-paste from shared/ — link to it.

---

## Legacy Source Folders

The following folders contain the **original** source files and are preserved intact.
Their content has been **copied** (not deleted) to the new structure.

| Original | Moved to | Status |
|---|---|---|
| `docs/adr/` | `docs/internal/design-decisions/` | Preserved |
| `docs/architecture/` | `docs/shared/` | Preserved |
| `docs/concepts/` | `docs/public/concepts/` | Preserved |
| `docs/contributing/` | `docs/public/guides/contributing-*.md` | Preserved |
| `docs/introduction/` | `docs/public/getting-started/` | Preserved |
| `docs/ARCHITECTURE.md` | `docs/shared/full-architecture.md` | Preserved |

These legacy folders will be removed once the new structure is confirmed correct.
