# Anclora Command Center

`dashboard/` es la app premium canónica `anclora-command-center` dentro de esta bóveda. La unificación actual concentra dos vistas en una sola shell compartida:

- `Command Center`: vista principal de coordinación y lectura ejecutiva.
- `Real Estate`: módulo migrado dentro de la misma app, accesible como segunda vista premium.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run generate:workbook`
- `npm run sync:notes`
- `npm run sync:vault`
- `npm run sync:real-estate`
- `npm run sync:all`
- `npm run watch:notes`
- `node --test ./scripts/read-dashboard-notes.test.mjs`
- `node --test ./scripts/generate-workbook-from-notes.test.mjs`
- `node --test ./scripts/watch-notes-and-sync.smoke.test.mjs`
- `node --test ./scripts/sync-real-estate-dataset.test.mjs`

## Contratos UX/UI

Lectura mínima antes de tocar interfaz:

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md`
3. `docs/standards/UI_MOTION_CONTRACT.md`
4. `docs/standards/MODAL_CONTRACT.md`
5. `docs/standards/LOCALIZATION_CONTRACT.md`
