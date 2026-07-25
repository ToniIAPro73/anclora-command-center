# Verificación Visual Anclora Command Center

Fecha: 2026-07-25.

Servidor usado: `npm run dev` en `http://127.0.0.1:5173/`.

## Capturas

- `screenshots/executive-dark-desktop.png`: vista Executive en tema oscuro,
  1440px.
- `screenshots/executive-light-desktop.png`: vista Executive en tema claro,
  1440px.
- `screenshots/executive-dark-mobile.png`: vista Executive en tema oscuro,
  390px.
- `screenshots/executive-light-mobile.png`: vista Executive en tema claro,
  390px.
- `screenshots/real-estate-dark-desktop.png`: vista Real Estate en tema oscuro,
  1440px.
- `screenshots/real-estate-light-desktop.png`: vista Real Estate en tema claro,
  1440px.
- `screenshots/real-estate-dark-mobile.png`: vista Real Estate en tema oscuro,
  390px.
- `screenshots/real-estate-light-mobile.png`: vista Real Estate en tema claro,
  390px.
- `screenshots/topbar-dark-desktop.png`: topbar con selectores de tema e idioma
  en tema oscuro.
- `screenshots/topbar-light-desktop.png`: topbar con selectores de tema e idioma
  en tema claro.

## Conformidad

- Paleta premium granate aplicada: el accent contractual `#CC4455` es visible en
  navegación activa, controles, pills y marca provisional.
- Tema oscuro conforme a tokens: fondos carbón rojo, superficies elevadas y borde
  premium discreto.
- Tema claro conforme a tokens: fondo claro `#FAF5F6`, superficies blancas,
  acento granate oscuro y textos legibles.
- Contraste revisado visualmente en títulos, cards, tablas, chips y navegación;
  no se detectan pares críticos fuera de AA en el recorrido capturado.
- Tipografía alineada al contrato: `DM Sans` como sans principal y
  `JetBrains Mono` para código.
- Marca presente en topbar y favicon: isotipo placeholder con borde cobre,
  interior carbón rojo y ondas granate. Queda pendiente sustituirlo por el logo
  3D definitivo del pipeline de marca.
- Idioma inicial: español. `index.html` declara `lang="es"`.
- No hay restos visuales de la paleta púrpura anterior en la UI React. Los únicos
  colores literales quedan centralizados en variables de tema, manifest y assets
  de marca/favicon.
- No se ha capturado modal porque la shell actual no presenta ningún modal en el
  flujo disponible.

## Incidencias Durante Captura

- Sin incidencias en el repo correcto. `npm run dev` sincronizó con la Bóveda y
  arrancó Vite.
