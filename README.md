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

- Solo GET (405 para el resto) — backend read-only.
- Loopback-only (`127.0.0.1:3024`); Caddy es el único entrypoint público.
- Sin ejecución arbitraria (único comando: `aos status --json`) y sin acceso
  arbitrario a filesystem (rutas fijas desde `ANCLORA_WORKSPACE`).
- Registrado como servicio AOS: `manifest.yaml` → `aos up command-center`.
- Vercel permanece como `LEGACY_DEPLOYMENT` (fallback; los snapshots
  estáticos que usa quedan marcados UNAVAILABLE si el workspace no existe).

## Fuentes de datos

| Fuente | Cómo se lee | Escritura |
|---|---|---|
| Anclora Knowledge/AKG | backend local lee `anclora-infrastructure/knowledge/generated/knowledge-model.json` (cache por mtime) → `/api/knowledge` → `knowledgeAdapter` | Nunca — solo lectura |
| AOS Runtime | backend local ejecuta `aos status --json` (contrato v1.0) → `/api/status` → `aosAdapter` | Nunca — solo lectura, sin `up`/`down`/`restart` |

Los `scripts/sync-*.mjs` y `src/generated/` quedan para desarrollo local y
compatibilidad con Vercel legacy; en producción VPS la UI consulta el backend.

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
`COMMAND_CENTER_DIST` (default `dist/`). Ver `server/server.mjs`.

## Caddy (pendiente de admin)

Bloque sugerido (aplicar con sudo, tras configurar auth — ver
`anclora-infrastructure/config/dev-endpoints.yaml` `security.status: blocked`):

```caddyfile
command-center.dev.anclora.com {
    import anclora_dev_endpoint 127.0.0.1:3024
}
```

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
