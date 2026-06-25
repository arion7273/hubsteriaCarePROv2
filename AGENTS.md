# AGENTS.md

## Cursor Cloud specific instructions

HubsteriaCarePRO is a **frontend-only** single-page app (Vite + React + TypeScript). There is no backend, database, or external service to run — all data is static fixtures under `src/data/`.

Standard commands live in `package.json` and `README.md`; use those as the source of truth. Key points for running/testing in this environment:

- **Node 22** is required (matches `.github/workflows/ci.yml`). The default environment Node already satisfies this.
- **Dev server:** `npm run dev` serves on port `5173` (configured with `--host 0.0.0.0`). The dev server logs render via tmux; `curl -s http://localhost:5173/` returning HTTP 200 confirms it is up.
- **Tests:** `npm test` (Vitest, jsdom). The suite takes ~20s.
- **Build:** `npm run build` runs `tsc -b && vite build`. `npm run verify` chains test + build.
- **No lint step exists** — there is no `lint` script and no ESLint config. Do not expect lint to run.
