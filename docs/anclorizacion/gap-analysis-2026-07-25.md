# Gap Analysis Anclora Command Center

Fecha: 2026-07-25.

Fuente canónica consultada: Bóveda Anclora en
`/mnt/c/Users/antonio.ballesterosa/Desktop/Proyectos/Boveda-Anclora`.

## Desviaciones Detectadas

- `src/index.css` define la plantilla base con paleta púrpura:
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
- `index.html` referencia `/favicon.svg`, que actualmente es un placeholder de
  Vite con paleta púrpura. Falta el paquete favicon `commandcenter_` definido
  por `ANCLORA_BRANDING_FAVICON_SPEC.md`.
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
- Accent canónico: `#CC4455`.
- Secondary: `#E89098`.
- Interior icono: `#1A1218`.
- Borde icono: cobre `#C07860`.
- Tipografía: `DM Sans` y `JetBrains Mono`.
- Visibilidad: privada permanente.
