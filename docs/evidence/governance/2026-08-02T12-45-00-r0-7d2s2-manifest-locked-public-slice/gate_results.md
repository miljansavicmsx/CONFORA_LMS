# Gate results (R0-7D2S2)

## typecheck:a11y

Command: `npm run typecheck:a11y`  
Result: **PASS** (exit 0)  
Log: `gates/typecheck-a11y.log`

## build:a11y

Command: `npm run build:a11y`  
Result: **PASS** (exit 0)  
Artifacts: `frontend-app/dist-a11y/` (gitignored), including `index.html` copy for SPA fallback  
Log: `gates/build-a11y-terminal.txt`

## preview routes

Command: `npm run preview:a11y -- --port 5174`  
Probes (HTTP 200, SPA shell with `#root` + assets):

- `/`
- `/login`
- `/verify`
- `/verify/deadbeef` (detail route host)

Log: `gates/preview-routes.txt`

## Production entry integrity

`frontend-app/src/main.tsx` and `frontend-app/src/App.tsx` were not modified in this phase.
