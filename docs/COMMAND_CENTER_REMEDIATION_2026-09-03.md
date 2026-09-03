# Informe de remediación de Anclora Command Center

Fecha: 2026-09-03
Repositorio: `/home/toni/workspace/anclora/anclora-command-center`
Rama: `development`
Commit base: `a1cd8f2fe8fa43d2a93888477f90026dc6ebf886`
Estado de entrega: remediación integrada en `development`; runtime canónico VPS/AOS.

## Resumen ejecutivo

Command Center queda como interfaz de observabilidad sobre AOS y Knowledge,
no como fuente de verdad de Governance, Vault o Infrastructure. Se corrigió la
única superficie de escritura local, `POST /api/services/:id/action`, con
fail-closed, autenticación Bearer servidor-a-servidor, allowlists, validación
AOS en vivo, `execFile` sin shell, timeout, mutex, idempotencia y errores
higienizados.

La SPA no recibe credenciales. Como no existe en este repositorio una sesión
server-side ni un proxy aprobado que transporte el token al backend, la UI
permanece explícitamente en SOLO LECTURA incluso si el endpoint S2S está
habilitado por configuración. `/api/audit` dejó de ser público y requiere la
misma credencial Bearer cuando existe; sin credencial responde `503 DISABLED`.

El binding loopback y el contrato local AOS fueron verificados. La exposición
real mediante Caddy, DNS, firewall y el estado efectivo del VPS no se puede
probar desde este checkout y permanece BLOQUEADO/PENDIENTE.

## Línea base y estado inicial

- branch: `development` (`git branch --show-current`).
- initial HEAD: `a1cd8f2fe8fa43d2a93888477f90026dc6ebf886` (`git rev-parse HEAD`).
- working tree inicial: modificaciones locales en `README.md`,
  `server/server.mjs`, `src/adapters/aosAdapter.test.ts`,
  `src/adapters/aosAdapter.ts`, `src/api/useOperationalData.ts`,
  `src/modules/operational/OperationalView.tsx`,
  `src/modules/operational/operational-view.css` y `tests/server.test.mjs`;
  archivos nuevos `.env.example`, este informe y
  `src/modules/operational/OperationalView.test.tsx`.
- diff inicial: `593 insertions(+), 61 deletions(-)` en los ocho archivos
  versionados que ya estaban modificados.
- comandos de captura: `git status --short`, `git branch --show-current`,
  `git log -5 --oneline`, `git diff --stat`, `git diff`.

Se conservaron esos cambios y se trabajó exclusivamente dentro de este
repositorio.

## Matriz del informe anterior

| Hallazgo | Estado | Evidencia y conclusión |
|---|---|---|
| R-02: exposición/control de acceso de dev endpoints | CORREGIDO EN RUNTIME | `command-center.dev.anclora.com` responde detrás de Caddy con autenticación Basic; `aos status command-center` confirma el proceso y health. La configuración AOS/Caddy permanece sin cambios. |
| R-03: POST de acciones sin autenticación | CORREGIDO | `server/server.mjs`, `handleServiceAction()`: flag/token antes de consultar servicio, Bearer estricto, comparación SHA-256 + `timingSafeEqual`, `401`/`403`, `execFile` sin shell. Tests de `tests/server.test.mjs`. |
| R-04: acoplamiento filesystem/fallos silenciosos | PENDIENTE | Los errores locales de AOS, Knowledge y Git ahora están higienizados y explícitos; el acoplamiento físico a `anclora-infrastructure` sigue siendo un contrato arquitectónico pendiente. README y `.anclora/AOS_ADOPTION.md` lo declaran. |
| R-09: límites operativos/documentación insuficientes | CORREGIDO | README, `.env.example`, `.anclora/AOS_ADOPTION.md` y este informe distinguen el runtime VPS/AOS, builds aislados, observabilidad, S2S y límites de responsabilidad. |
| RM-03: flag booleano sin credencial | CORREGIDO | Se exige `COMMAND_CENTER_WRITE_ACTIONS_ENABLED === 'true'` y token no vacío; serverless fuerza `DISABLED`. |
| RM-04: contrato frontend/backend incoherente | CORREGIDO | `writeActionsUiAvailable` está separado de la capacidad S2S; la UI no renderiza controles operativos ni envía token. Tests de `aosAdapter` y `OperationalView`. |
| RM-05: fuga de secretos/rutas/stderr | CORREGIDO | Errores de AOS, Knowledge, Git y acciones no incluyen rutas ni stderr; startup tampoco registra rutas absolutas. Tests verifican token, `stderr`, `boom` y rutas ausentes de respuestas. |
| RM-06: carreras y repetición de acciones | CORREGIDO | Mutex por `serviceId`, estados repetidos/transitorios devuelven `409 CONFLICT`; timeout y limpieza del mutex están probados. |
| A-01: `/api/audit` público | CORREGIDO | Bearer obligatorio cuando hay token; sin token `503 DISABLED`; respuesta acotada a 200 entradas en memoria. Tests de acceso válido, ausente, inválido y fuga de token. |
| A-02: afirmación de modo UI operativo | CORREGIDO | Se eliminó el token opcional del adaptador cliente; la SPA permanece SOLO LECTURA porque no hay canal UI seguro verificable. |

## Diferencia entre correcciones locales y dependencias externas

Correcciones realizadas aquí: servidor HTTP, política de escritura, API S2S,
auditoría, ejecución de AOS, errores, adaptadores, hook, UI, documentación y
tests.

Dependencias no modificadas: `anclora-infrastructure`, Caddy, DNS, UFW,
systemd/AOS del VPS, Governance y Vault. Se leyó el contrato local externo:
`aos-runtime/manifest.yaml` contiene `command-center` en `127.0.0.1:3024` y
health `/health`; `config/dev-endpoints.yaml` mantiene `security.status:
blocked`. Esto verifica el checkout del contrato, no el estado desplegado.

## Arquitectura final de seguridad

```text
Navegador --solo GET--> Caddy (si Infrastructure lo activa) --> 127.0.0.1:3024
                                                             --> AOS status / Knowledge

Cliente S2S autorizado -- Bearer --> 127.0.0.1:3024
                                   --> policy --> auth --> validación --> AOS
```

El navegador nunca conoce `COMMAND_CENTER_ACTIONS_TOKEN`; por eso
`writeActionsUiAvailable` es falso. Las acciones directas S2S solo pasan si:

1. `COMMAND_CENTER_WRITE_ACTIONS_ENABLED` es exactamente `true`.
2. No es un runtime serverless/no-AOS.
3. `COMMAND_CENTER_ACTIONS_TOKEN` existe y no está vacío.
4. La petición lleva únicamente `Authorization: Bearer <token>`.
5. La operación es `start`, `stop` o `restart`, el `serviceId` coincide con el
   formato permitido y el servicio existe en el `aos status --json` vivo con
   `managed: aos`.

`command-center` no admite stop/restart desde esta ruta. `start`/`stop` que ya
coinciden con el estado actual y estados transitorios se rechazan con
`409 CONFLICT`. Se ejecuta `aos up|down|restart <serviceId>` mediante argumentos
separados y `shell: false`.

## Cambios por archivo

- `server/server.mjs`: fail-closed, serverless guard, Bearer timing-safe,
  correlationId, `/api/audit` protegido, sanitización, códigos estables,
  timeout validado, mutex, idempotencia, body/URL/path guards y binding fijo.
- `src/adapters/aosAdapter.ts`: contrato separado para capacidad S2S y UI;
  el adaptador cliente no acepta ni adjunta tokens.
- `src/api/useOperationalData.ts`: propaga `writeActionsUiAvailable`.
- `src/modules/operational/OperationalView.tsx` y
  `src/modules/operational/operational-view.css`: SOLO LECTURA explícito,
  controles no operativos, estados accesibles y mensajes comprensibles.
- `src/shell/DashboardShell.tsx`: `h1` y grupos ARIA válidos.
- `tests/server.test.mjs`, `src/adapters/aosAdapter.test.ts` y
  `src/modules/operational/OperationalView.test.tsx`: regresiones de seguridad,
  contrato, concurrencia, errores y UI.
- `.env.example`: defaults y límites sin secretos.
- `README.md` y `.anclora/AOS_ADOPTION.md`: límites reales y dependencias
  externas sin declarar Infrastructure corregido.

## Contrato HTTP y política de `/api/audit`

| Ruta | Respuesta relevante |
|---|---|
| `POST /api/services/:id/action` con flag/token no válidos | `503`, `DISABLED`; no consulta servicio ni ejecuta proceso |
| Misma ruta sin Bearer / esquema incorrecto | `401`, `UNAUTHORIZED` |
| Token inválido | `403`, `FORBIDDEN` |
| Servicio/op/body inválidos | `400`, `INVALID_SERVICE` o `INVALID_ACTION` en `code` |
| Servicio inexistente | `404`, `NOT_FOUND` |
| Servicio externo, self-stop o carrera | `403 FORBIDDEN`, `409 BLOCKED` o `409 CONFLICT` |
| Fallo/timeout AOS | `500 INTERNAL_ERROR` o `504 TIMEOUT` |
| Acción ejecutada | `200 OK` con servicio, operación, duración y correlationId |
| `GET /api/audit` sin credencial configurada | `503 DISABLED`, sin entradas |
| `GET /api/audit` sin/incorrecta credencial configurada | `401`/`403`, sin entradas |
| `GET /api/audit` autenticado | `200 OK`, máximo 200 entradas, sin token/stderr/rutas |

La auditoría es un búfer circular en memoria, no persistente ni de cumplimiento;
se pierde al reiniciar. No se guardan intentos no autenticados o deshabilitados,
para no convertir la ruta en un canal de enumeración.

## Variables y defaults

- `COMMAND_CENTER_PORT`: `3024`.
- `COMMAND_CENTER_WRITE_ACTIONS_ENABLED`: ausente/vacío/cualquier valor salvo
  `true` ⇒ escritura deshabilitada.
- `COMMAND_CENTER_ACTIONS_TOKEN`: sin default; solo proceso backend/S2S, nunca
  bundle, URL, body, cookie, localStorage o sessionStorage.
- `COMMAND_CENTER_ACTION_TIMEOUT_MS`: 20 000 ms; valores inválidos o fuera de
  100–120 000 ms vuelven al default.
- `ANCLORA_WORKSPACE` y `COMMAND_CENTER_DIST`: rutas configurables del proceso;
  no provienen de la petición.
- Runtime serverless/no-AOS: escrituras siempre deshabilitadas.

## Tests y resultados reales

Ejecutado desde el repositorio:

- `npm test`: VERIFICADO; Vitest `14` archivos, `185` tests; node:test `66`
  tests, todos pass.
- `npm run lint`: VERIFICADO; exit `0`, sin errores.
- `npm run build`: VERIFICADO; `tsc -b` y `vite build` exit `0`.
- `git diff --check`: VERIFICADO; exit `0`.
- Búsqueda de ejecución: solo `execFile` con `shell: false`; no existe ruta
  genérica de comandos Git/AOS.

La prueba de proceso directo usa un workspace falso y cubre variable ausente,
vacía, `false`, `true` sin token, token vacío, serverless, auth, query/body,
allowlist, traversal/inyección, servicio externo/inexistente, self-stop,
repetición, concurrencia, timeout, fallo higienizado y auditoría.

## Verificación operativa y visual

Backend real arrancado con `npm run serve`: `127.0.0.1:3024`. Frontend real
arrancado con `npm run dev -- --host 127.0.0.1 --port 4173`.

`agent-browser` necesitó `--args '--no-sandbox'` por la restricción del
contenedor Chromium (`No usable sandbox`). Tras ese reintento:

- Overview, Products, Repositories, Services y Knowledge cargaron con contenido.
- Services mostró SOLO LECTURA y `0` botones Iniciar/Detener/Reiniciar.
- Viewports comprobados: `1440x900`, `1366x768`, `768x1024`, `375x667`.
- En los cuatro: sin overflow horizontal.
- Consola: solo mensajes informativos de Vite/React DevTools; sin errores.
- Axe en las cinco rutas y ambos temas: `0` violations. Axe deja incompleta la
  regla `color-contrast` cuando el fondo es un gradiente; esa limitación se
  cubre abajo con cálculo específico de tokens y extremos/paradas reales.
- Evidencia capturada fuera del repositorio: `/tmp/cc-contrast-final-*` (40
  capturas, una por combinación) y `/tmp/cc-contrast-{dark,light}-focus-1440x900.png`.

## Verificación específica de contraste — 2026-09-03

Estado de esta comprobación: PASS_WITH_GAPS. Las superficies revisadas cumplen
AA; el dataset operativo real no reproduce una vista visual de error/warning y
Axe deja una comprobación
`incomplete` para gradientes; la limitación está cubierta por cálculo específico
de tokens, extremos de gradiente y revisión visual. No se declara que axe pueda
medir por sí solo todos los gradientes.

### Problemas encontrados

- En modo claro, el Design System conservaba superficies oscuras en
  `ac-empty-state`; su texto oscuro quedaba sobre un panel oscuro.
- `HEALTHY` y otros estados usaban texto/fondo pálidos de tema oscuro en claro.
- `--secondary` azul y `--accent` morado se usaban como texto con ratios
  inferiores a AA en claro (`3.23:1` y `4.03:1` sobre el canvas anterior).
- El texto blanco del botón activo no cumplía AA en el extremo azul del
  gradiente oscuro (`3.47:1`).
- Bordes de controles y focus rings dependían de transparencias débiles.
  Axe también detectó una etiqueta ARIA sobre un `div` sin rol.

### Componentes y tokens corregidos

- `src/index.css`: aliases DS `--bg*`/`--fg*`, tokens semánticos por tema para
  estados, enlaces, foco, bordes, superficies y texto de acción; superficies
  DS claras y colores azul/morado AA en claro.
- `src/index.css`: `success`, `warning`, `danger`, `info`, `neutral` y `muted`
  tienen borde identificable además de fondo/texto.
- `src/modules/operational/operational-view.css`: estados de éxito/error y
  solo lectura usan tokens, enlaces operativos y focus ring reforzados.
- `src/modules/operational/entity-modal.css` y `global-search.css`: enlaces y
  focus ring semánticos.
- `src/App.css`: focus visible para navegación, buscador, toggles y filtros;
  botones secundarios/ghost con estados claros en claro.
- `src/modules/operational/OperationalView.tsx`: `Necesita atención` usa
  `section` con nombre accesible válido.

### Valores y criterios aplicados

La prueba `src/a11y/contrast.test.ts` lee tokens CSS de ambos temas y
comprueba WCAG 2.2 AA: texto normal `>= 4.5:1`, controles/bordes/foco
`>= 3:1`. Comprueba `HEALTHY/SUCCESS`, warning, error/danger, info,
`SOLO LECTURA/muted`, enlaces, texto secundario, botones y texto sobre ambos
extremos de los gradientes `accent → secondary` y `card → surface/sidebar`.

| Superficie | Claro | Oscuro |
| --- | ---: | ---: |
| texto secundario / canvas | 9.78:1 | 10.59:1 |
| texto muted / superficie | 6.67:1 | 5.28:1 |
| enlace / canvas | 6.08:1 | 8.77:1 |
| badge success texto / fondo | 7.07:1 | 9.18:1 |
| badge warning texto / fondo | 7.19:1 | 8.46:1 |
| badge danger texto / fondo | 6.46:1 | 8.22:1 |
| badge info texto / fondo | 7.46:1 | 8.38:1 |
| texto de acción / parada menos favorable | 6.08:1 | 4.56:1 |
| borde/focus frente a superficie | 4.37:1 | 3.63:1 |

El panel vacío de `Necesita atención` usa superficies DS claras en claro y
oscuras en oscuro. Texto principal y descriptivo se comprueban contra el peor
extremo sólido y las paradas de superficie, no contra un color nominal único.
Los halos no sustituyen un color de texto con contraste suficiente.

### Viewports, vistas y evidencia

Se verificaron las 40 combinaciones reales (5 rutas × 4 viewports × 2 temas):
Overview, Products, Repositories, Services y Knowledge en `1440×900`,
`1366×768`, `768×1024` y `375×667`. Herramienta: `agent-browser` contra Vite
real y backend local real. Cada combinación cargó contenido, no mostró overlay
ni errores de consola y no tuvo overflow horizontal. Services mostró
`SOLO LECTURA` y cero controles de escritura; el foco de teclado fue visible
en claro (`#4F47D8`) y oscuro (`#B1A7FF`). Evidencia: `/tmp/cc-contrast-*`.
Las vistas visuales de error/warning no fueron reproducibles con el estado real
disponible; los tokens de ambos tonos sí quedan medidos en
`src/a11y/contrast.test.ts`.

| Viewport | Tema | Vista | Herramienta | Contraste | Evidencia | Restantes |
| --- | --- | --- | --- | --- | --- | --- |
| 1440×900 | dark | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-overview-1440x900.png` | — |
| 1366×768 | dark | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-overview-1366x768.png` | — |
| 768×1024 | dark | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-overview-768x1024.png` | — |
| 375×667 | dark | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-overview-375x667.png` | — |
| 1440×900 | dark | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-products-1440x900.png` | — |
| 1366×768 | dark | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-products-1366x768.png` | — |
| 768×1024 | dark | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-products-768x1024.png` | — |
| 375×667 | dark | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-products-375x667.png` | — |
| 1440×900 | dark | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-repositories-1440x900.png` | — |
| 1366×768 | dark | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-repositories-1366x768.png` | — |
| 768×1024 | dark | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-repositories-768x1024.png` | — |
| 375×667 | dark | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-repositories-375x667.png` | — |
| 1440×900 | dark | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-dark-services-1440x900.png` | — |
| 1366×768 | dark | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-dark-services-1366x768.png` | — |
| 768×1024 | dark | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-dark-services-768x1024.png` | — |
| 375×667 | dark | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-dark-services-375x667.png` | — |
| 1440×900 | dark | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-knowledge-1440x900.png` | — |
| 1366×768 | dark | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-knowledge-1366x768.png` | — |
| 768×1024 | dark | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-knowledge-768x1024.png` | — |
| 375×667 | dark | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-dark-knowledge-375x667.png` | — |
| 1440×900 | light | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-overview-1440x900.png` | — |
| 1366×768 | light | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-overview-1366x768.png` | — |
| 768×1024 | light | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-overview-768x1024.png` | — |
| 375×667 | light | Overview | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-overview-375x667.png` | — |
| 1440×900 | light | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-products-1440x900.png` | — |
| 1366×768 | light | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-products-1366x768.png` | — |
| 768×1024 | light | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-products-768x1024.png` | — |
| 375×667 | light | Products | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-products-375x667.png` | — |
| 1440×900 | light | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-repositories-1440x900.png` | — |
| 1366×768 | light | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-repositories-1366x768.png` | — |
| 768×1024 | light | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-repositories-768x1024.png` | — |
| 375×667 | light | Repositories | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-repositories-375x667.png` | — |
| 1440×900 | light | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-light-services-1440x900.png` | — |
| 1366×768 | light | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-light-services-1366x768.png` | — |
| 768×1024 | light | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-light-services-768x1024.png` | — |
| 375×667 | light | Services | agent-browser | PASS; badges/read-only AA | `/tmp/cc-contrast-light-services-375x667.png` | — |
| 1440×900 | light | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-knowledge-1440x900.png` | — |
| 1366×768 | light | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-knowledge-1366x768.png` | — |
| 768×1024 | light | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-knowledge-768x1024.png` | — |
| 375×667 | light | Knowledge | agent-browser | PASS; AA por tokens/paradas | `/tmp/cc-contrast-light-knowledge-375x667.png` | — |

### Tests ejecutados y pendientes

- `npm test`: PASS — Vitest 14 archivos/185 tests y node:test 66/66.
- `npm run lint`: PASS — exit 0.
- `npm run build`: PASS — TypeScript y Vite exit 0.
- `git diff --check`: PASS — exit 0.
- `agent-browser a11y`: PASS — 0 violations en las 10 combinaciones de ruta y
  tema auditadas a `1440×900`; `color-contrast` queda `incomplete` solo en
  nodos cuyo fondo es gradiente, cubiertos por el test específico y la
  comprobación visual anterior.
- Pendiente externa, fuera de este trabajo: VPS, Caddy, DNS, firewall,
  systemd/AOS efectivo y contrato API versionado de Infrastructure.

## Riesgos residuales y bloqueos

- BLOQUEADO: no se verificó el VPS real, Caddy activo, DNS, UFW ni systemd.
- BLOQUEADO: `security.status: blocked` en Infrastructure impide declarar
  exposición pública corregida.
- PENDIENTE: la UI no puede ejecutar acciones hasta que exista y se apruebe
  una sesión server-side/proxy que no exponga secretos; el canal S2S directo
  no habilita botones en navegador.
- PENDIENTE: el acoplamiento de lectura por filesystem a Infrastructure no es
  un contrato API/versionado.
- PENDIENTE: auditoría no persistente; no sustituye journald/colector de
  cumplimiento.

## Validación posterior

1. En un host controlado, confirmar el contrato externo y el estado efectivo de
   `aos status --json`, el bind loopback, Caddy, DNS, firewall y auth perimetral.
2. Mantener `COMMAND_CENTER_WRITE_ACTIONS_ENABLED=false` hasta que Governance
   apruebe el canal y se aprovisione el secreto fuera del repositorio.
3. Si se habilita S2S, configurar el token solo en el entorno del backend,
   probar `401`, `403`, `503`, `409`, `504` y `200`, y comprobar que `/api/audit`
   nunca sea accesible sin Bearer.
4. No habilitar escrituras fuera del runtime VPS/AOS.
5. Reejecutar `npm test`, `npm run lint`, `npm run build` y `git diff --check`.

## Release

- commit realizado: SÍ — `fix(a11y): remediate command center contrast`.
- push realizado: SÍ — `development` → `origin/development`.
- Vercel: RETIRADO / UNSUPPORTED; no forma parte del runtime ni de la aceptación.
- proyecto Vercel `anclora-command-center`: OWNER_DELETE_PENDING.
- runtime canónico: `https://command-center.dev.anclora.com/`.
- verificación visual: la matriz local y la auditoría axe documentadas siguen siendo la evidencia válida.
