<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-command-center.png" alt="Anclora Command Center" width="132" />

# Anclora Command Center

### Interfaz operacional del ecosistema Anclora

Panel operativo que lee, en solo lectura, datos derivados de AOS, Anclora Knowledge y AKG v0.1, y los presenta en vistas de estado del ecosistema.

**Español** · [English](./README.en.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoría](https://img.shields.io/badge/categoría-Premium-6C63FF)
![Idiomas](https://img.shields.io/badge/idiomas-ES%20%7C%20EN%20%7C%20DE-047857)

</div>

---

> [!IMPORTANT]
> Repositorio interno del ecosistema Anclora. No es fuente de verdad de products, repositories, contracts, services ni endpoints — consume esos datos desde Anclora Knowledge/AKG y AOS. No publicar detalles operativos, credenciales ni lógica sensible fuera de canales autorizados.

## Qué es

Anclora Command Center es la interfaz operacional del ecosistema: lee snapshots de solo lectura generados en build/dev time desde `anclora-infrastructure/knowledge` (Knowledge/AKG) y desde el CLI `aos status` (AOS Runtime), y los presenta en 5 vistas — Overview, Products, Repositories, Services, Knowledge.

Reconstruido en `COMMAND_CENTER_REBUILD` (2026-08-17) para eliminar su papel histórico como almacén local de datos sincronizados desde un vault personal externo. Ver `anclora-infrastructure/audit/command-center-rebuild/` para la auditoría completa de la reconstrucción.

## Estado y rol en el ecosistema

| Campo | Valor |
|---|---|
| Current status | `HOLD` |
| Role | Operational UI — interfaz operacional de consumo, no fuente de datos |
| Data sources | AOS (CLI `aos status`) · Anclora Knowledge · AKG v0.1 |
| Source of truth local | **NO**, para: products, repositories, contracts, services, endpoints — consumidos vía `src/adapters/` desde snapshots regenerables (`src/generated/`, gitignored, nunca fuente) |
| AOS adoption | `Adopted With Exceptions` (ver `.anclora/AOS_ADOPTION.md`) |

## Categoría en el ecosistema

| Campo | Valor |
|---|---|
| Categoría | Premium |
| Acento de marca | `#6C63FF` |
| Repositorio canónico | `anclora-command-center` |
| Ubicación | `workspace/anclora/anclora-command-center` (checkout independiente) |

## Arquitectura

```
src/
  adapters/       # unica frontera entre snapshots JSON crudos y los contratos UI
  contracts/      # tipos UI estables (RepositorySummary, ProductSummary, ServiceSummary, ...)
  modules/
    operational/  # vistas: Overview, Products, Repositories, Services, Knowledge
  shell/          # shell de navegacion/tema/idioma (reutilizado del pre-rebuild)
```

Los componentes React nunca leen `src/generated/*.json` directamente ni recorren el schema interno de Knowledge/AKG — siempre pasan por `src/adapters/` (mappers puros + proxy async alimentado por `src/api/useOperationalData.ts`). Ver `anclora-infrastructure/audit/command-center-rebuild/04-adapter-architecture.md` y `anclora-infrastructure/audit/command-center-vps-native/`.

## Deployment: VPS-native (primario) vs Vercel (legacy)

Desde `COMMAND_CENTER_VPS_NATIVE_DEPLOYMENT` (2026-08-17), el deployment
operacional primario es **VPS-native** dentro de AOS: un backend local mínimo
(`server/server.mjs`, Node nativo, sin dependencias) sirve la SPA (`dist/`) y
expone los datos operacionales REALES:

| Endpoint | Fuente | Caducidad |
|---|---|---|
| `GET /health` | proceso vivo | — |
| `GET /api/status` | `aos status --json` EN VIVO (schemaVersion 1.0) | sin cache |
| `GET /api/knowledge` | `knowledge-model.json` derivado (Knowledge/AKG) | cache por mtime |
| `GET /api/audit` | Auditoría de acciones en memoria | autenticada si existe credencial; no disponible sin ella |

### Escrituras explícitamente restringidas

`POST /api/services/:id/action` es el único endpoint que puede invocar
`aos up|down|restart`. Permanece **fail-closed**: si
`COMMAND_CENTER_WRITE_ACTIONS_ENABLED` falta, está vacío, no es exactamente
`true`, falta `COMMAND_CENTER_ACTIONS_TOKEN`, o el proceso corre en serverless,
responde `503` con código `DISABLED` sin consultar el servicio ni ejecutar un
proceso.

Cuando se habilita expresamente en un backend VPS, la ruta es un canal
servidor-a-servidor: solo acepta `Authorization: Bearer <token>`, compara la
credencial con `timingSafeEqual`, y devuelve `401`/`403` según corresponda.
Nunca acepta credenciales en query, body, cookies improvisadas o headers
alternativos. La SPA no tiene una sesión server-side ni un proxy aprobado para
transportar ese token, por lo que **siempre muestra SOLO LECTURA** y nunca lo
incluye en el bundle, almacenamiento del navegador o petición.

La ejecución usa allowlists y `execFile` sin shell, valida el servicio en vivo
contra AOS (`managed: aos`), bloquea `command-center` para stop/restart,
rechaza acciones repetidas o concurrentes con `409 CONFLICT`, limita el body y
el timeout (`COMMAND_CENTER_ACTION_TIMEOUT_MS`, default 20 s), y devuelve
errores higienizados con `correlationId`. Las acciones ejecutadas se guardan en
un búfer circular en memoria de 200 entradas.

- El resto del backend es solo lectura; los métodos no permitidos devuelven 405.
- Loopback-only (`127.0.0.1:3024`); Caddy es el único entrypoint público.
- Sin ejecución arbitraria: solo `aos status --json` en lecturas y `aos up|down|restart <serviceId>` en la ruta S2S autenticada.
- `/api/audit` no es público: requiere la misma credencial Bearer cuando está configurada y devuelve `503 DISABLED` sin ella.
- Registrado como servicio AOS: `manifest.yaml` → `aos up command-center`.
- Vercel/legacy y cualquier entorno serverless permanecen en SOLO LECTURA.

## Fuentes de datos

| Fuente | Cómo se lee | Escritura |
|---|---|---|
| Anclora Knowledge/AKG | backend local lee `anclora-infrastructure/knowledge/generated/knowledge-model.json` (cache por mtime) → `/api/knowledge` → `knowledgeAdapter` | Nunca — solo lectura |
| AOS Runtime | backend local ejecuta `aos status --json` → `/api/status` → `aosAdapter` | Las acciones S2S autorizadas son la única excepción (`aos up/down/restart`) |

Los `scripts/sync-*.mjs` y `src/generated/` quedan para desarrollo local y
compatibilidad con Vercel legacy; en producción VPS la UI consulta el backend.

### Contrato de lectura de repos hermanos (acoplamiento por ruta de fichero)

El backend y los scripts `sync-*` leen `anclora-infrastructure` vía ruta de
fichero relativa (`../anclora-infrastructure/...` bajo `ANCLORA_WORKSPACE`),
no vía API/paquete versionado — frágil fuera del layout físico exacto del
workspace local (p. ej. Vercel, donde solo se clona este repositorio).

Contrato explícito ya implementado (no silencioso): si el artefacto de
`anclora-infrastructure` no existe o es ilegible, tanto el backend
(`/api/status`, `/api/knowledge`) como `scripts/sync-*.mjs` devuelven un
estado `UNAVAILABLE`/`ERROR` con motivo explícito — nunca fabrican datos ni
fallan en silencio (ver tests en `tests/server.test.mjs`, casos
"ausente"/"malformado"). Migrar esta dependencia a un contrato de API/paquete
versionado es una propuesta arquitectónica pendiente de decisión de
gobernanza (fuera de alcance de una corrección acotada); esta sección
documenta el contrato de lectura actual mientras esa migración no ocurre.

## Arranque

```bash
npm install
npm run dev      # sincroniza Knowledge/AOS y arranca Vite (HMR; proxea /api y /health al backend)
npm run build    # typecheck + build de producción (dist/)
npm run serve    # backend VPS-native: sirve dist/ + /api/* + /health (default :3024)
npm test         # vitest (adapters/mappers) + node:test (backend)
npm run lint
```

`npm run dev` solo arranca el frontend (Vite): la SPA llama a `/api/*` con rutas
relativas y Vite las proxea al backend VPS-native (`vite.config.ts`,
`server.proxy` → `http://127.0.0.1:$COMMAND_CENTER_PORT`, default 3024). Para
desarrollo con HMR hay que tener `npm run serve` corriendo en otra terminal; sin
backend, las llamadas `/api/*` fallan. `npm run serve` por sí solo sirve la app
completa (SPA compilada en `dist/` + API) — es el modo operativo validado.

Configuración (env, opcional — defaults derivados del workspace):
`ANCLORA_WORKSPACE` · `COMMAND_CENTER_PORT` (default 3024) ·
`COMMAND_CENTER_DIST` (default `dist/`) ·
`COMMAND_CENTER_WRITE_ACTIONS_ENABLED` (default deshabilitado) ·
`COMMAND_CENTER_ACTIONS_TOKEN` (sin default; nunca se entrega al cliente) ·
`COMMAND_CENTER_ACTION_TIMEOUT_MS` (default 20000; máximo 120000). Ver
`.env.example` y `server/server.mjs`.

## Caddy (pendiente de admin)

Bloque sugerido (no aplicado): Infrastructure mantiene
`security.status: blocked` y `docs/DEV_ENDPOINTS.md` declara Command Center
configurado pero no expuesto. Solo el administrador de Infrastructure puede
crear el include de auth, configurar DNS, validar y recargar Caddy:

```caddyfile
command-center.dev.anclora.com {
    import anclora_dev_endpoint 127.0.0.1:3024
}
```

No se declara aquí que Caddy, DNS, firewall, Governance, Vault o Infrastructure
estén corregidos. Esta aplicación solo verifica su binding loopback y refleja
el estado externo observado.

## Idiomas soportados

- Español (predeterminado)
- English
- Deutsch

## Documentación y gobernanza

- Fuente de verdad canónica: `anclora-vault` (documentación) y `anclora-governance` (constitución/decisiones/estándares) — no este repositorio.
- Registro de scope y metadata: `anclora-vault/00-governance/registry/ecosystem-repos.json`
- Contratos de gobernanza: no se mantienen copias locales — ver `docs/standards/README.md`
- AOS adoption de este repo: `.anclora/AOS_ADOPTION.md`
- Auditoría de la reconstrucción: `anclora-infrastructure/audit/command-center-rebuild/`

---

<div align="center">

### Anclora Group

Uso interno.

</div>
