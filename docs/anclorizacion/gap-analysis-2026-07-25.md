# Gap Analysis Anclora Command Center

Fecha: 2026-07-25.

Fuente canónica consultada: Bóveda Anclora en
`/mnt/c/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora`.

## Desviaciones Detectadas

- `src/index.css` define la plantilla base con paleta púrpura antigua:
  `#121021`, `#ece7ff` y `#e6e2fb`.
- `src/App.css` contiene colores hardcodeados de la paleta anterior:
  `#8a7cff`, `#6c63ff`, `#b886ff`, `#eae8f5`, `#ece7ff`,
  `#f4f1ff`, `#e7e2fb` y múltiples `rgba(...)` derivados de azul,
  violeta y blanco.
- La tipografía global usa `"Aptos"`, `"Segoe UI Variable"` y `"Segoe UI"`.
  El contrato premium exige `DM Sans` para interfaz y `JetBrains Mono` para
  monospace.
- `src/App.css` usa stack serif en títulos (`Iowan Old Style`, `Palatino
  Linotype`, `Book Antiqua`, `Georgia`). El contrato premium no permite que
  esta app herede una estética serif de plantilla.
- `index.html` declara `lang="en"`. La app debe arrancar en español y mantener
  cobertura `es`, `en`, `de`.
- `index.html` referenciaba `/favicon.svg`, que era un placeholder.
  El paquete favicon `commandcenter_` debe generarse desde el logo real
  disponible en `public/brand/logo-anclora-command-center.png`.
- `src/generated/dataset.json` está versionado como dataset de demostración.
  Falta marca raíz `"synthetic": true`.
- No se ha encontrado una ruta absoluta Windows `C:\Users\...` dentro de
  `src/generated/dataset.json`; el campo `sourceWorkbook` usa una ruta relativa.
- `.gitignore` no ignora `src/generated/`, por lo que el dataset generado queda
  intencionadamente versionado para que la app pueda compilar.
- `README.md` apunta la lectura mínima de contratos a `contracts/core/...`,
  `contracts/components/...` y `contracts/logic/...`, rutas que no existen en
  este repo. Las copias reales están en `docs/standards/`.
- `docs/standards/` contiene snapshots locales de contratos de la Bóveda, pero
  todavía no indica explícitamente que la fuente canónica es la Bóveda Anclora.

## Valores Contractuales Relevantes

- App: `anclora-command-center`.
- Familia: Premium.
- Accent canónico: `#6C63FF`.
- Secondary: `#5FA8FF`.
- Hover: `#8A7CFF`.
- Fondos canónicos: `#1E1A2E` y `#121021`.
- Tipografía: `DM Sans` y `JetBrains Mono`.
- Visibilidad: privada permanente.
