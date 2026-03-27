Anclora Command Center Dashboard

Aplicacion local para visualizar el estado de `Anclora Command Center.md` con una interfaz tipo producto, manteniendo la boveda como fuente de verdad.

Como funciona

1. La boveda sigue siendo el sistema editorial.
2. `scripts/sync-vault-data.mjs` lee `Anclora Command Center.md` y notas relacionadas.
3. El script genera `src/generated/vault-data.json`.
4. La app React renderiza ese JSON con una UI estilo Anclora.

Comandos

Desarrollo con sincronizacion viva

    npm.cmd run dev

Esto:
- sincroniza los markdown de la boveda
- arranca Vite
- observa cambios en notas clave y regenera el JSON

Sincronizacion manual

    npm.cmd run sync:vault

Build de produccion

    npm.cmd run build

Notas observadas

El modo `dev` vigila:
- `Anclora Command Center.md`
- `resources/`
- `personas/`
- `playbooks/`
- `ideas/`
- `templates/partner-synergi.md`

Objetivo de esta primera version

- mantener el dashboard alineado con la boveda
- dar una experiencia visual mas parecida a una app real del ecosistema Anclora
- evitar duplicar informacion o crear una segunda fuente de verdad
