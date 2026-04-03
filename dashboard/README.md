# Anclora Command Center

`dashboard/` es la app premium canónica `anclora-command-center` dentro de esta bóveda. La unificación actual concentra dos vistas en una sola shell compartida:

- `Command Center`: vista principal de coordinación y lectura ejecutiva.
- `Real Estate`: módulo migrado dentro de la misma app, accesible como segunda vista premium.

`dashboard-cuadro-de-mando/` no es el target arquitectónico. Se mantiene solo como superficie legacy en migración o phase-out hasta cerrar la transición.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run sync:vault`
- `npm run sync:real-estate`
- `node --test ./scripts/sync-real-estate-dataset.test.mjs`

## Contratos UX/UI

Lectura mínima antes de tocar interfaz:

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md`
3. `docs/standards/UI_MOTION_CONTRACT.md`
4. `docs/standards/MODAL_CONTRACT.md`
5. `docs/standards/LOCALIZATION_CONTRACT.md`
