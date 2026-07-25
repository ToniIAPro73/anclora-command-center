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

- Paleta premium azul/violeta aplicada: el accent contractual `#6C63FF`, el
  secondary `#5FA8FF` y el hover `#8A7CFF` son visibles en navegación activa,
  controles, pills y marca real.
- Tema oscuro conforme a tokens: fondos navy/púrpura `#121021` y `#1E1A2E`,
  superficies elevadas y borde premium discreto.
- Tema claro conforme a tokens: fondo claro `#FAF5F6`, superficies blancas,
  acento violeta y textos legibles.
- Contraste revisado visualmente en títulos, cards, tablas, chips y navegación;
  no se detectan pares críticos fuera de AA en el recorrido capturado.
- Tipografía alineada al contrato: `DM Sans` como sans principal y
  `JetBrains Mono` para código.
- Marca presente en topbar y favicon: se usa el logo real
  `public/brand/logo-anclora-command-center.png` y los favicons se regeneran
  desde ese asset.
- Idioma inicial: español. `index.html` declara `lang="es"`.
- No hay restos visuales de la paleta púrpura anterior en la UI React. Los únicos
  colores literales quedan centralizados en variables de tema, manifest y assets
  de marca/favicon.
- No se ha capturado modal porque la shell actual no presenta ningún modal en el
  flujo disponible.

## Incidencias Durante Captura

- Sin incidencias en el repo correcto. `npm run dev` sincronizó con la Bóveda y
  arrancó Vite.
