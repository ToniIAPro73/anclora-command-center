# Auditoría de sincronización de Command Center — 2026-09-27

## Resultado

`anclora-command-center` queda preparado para revisión interna. La fuente AKG se
regeneró después de CHG-0019 y ahora refleja Command Center como `internal/ACTIVE`
con runtime AOS/VPS. No se promocionó ni desplegó ningún repositorio.

## Mapa de fuentes

| Dato | Fuente canónica | Adapter/API | UI | Estado |
| --- | --- | --- | --- | --- |
| Productos, repositorios, relaciones y conflictos | `anclora-infrastructure/knowledge/generated/knowledge-model.json`, derivado de Vault | `knowledgeAdapter` ← `/api/knowledge` | Products, Repositories, Knowledge, búsqueda y modales | READY/STALE según `metadata.generated_at` |
| Servicios y endpoints vivos | `aos status --json` | `aosAdapter` ← `/api/status` | Services, Overview e incidencias | READY/ERROR/UNAVAILABLE según contrato AOS |
| Tier/estado de Command Center | Vault `CHG-0019`, registry y dossier | Knowledge pipeline + adapter | Products/Repositories | `internal/ACTIVE` |
| Runtime de Command Center | Infrastructure `aos-runtime/manifest.yaml` y `.anclora/AOS_ADOPTION.md` | AOS adapter | Services/entidad | AOS/VPS; `aos up/down command-center` |
| URL de CleanSheet | Vault registry, respaldado por el contrato SecureFlow de Group | Knowledge pipeline + adapter | Products/entidad | `https://cleansheet.anclora.com/` |

## Hallazgos corregidos

1. El artefacto Knowledge estaba congelado en agosto y mostraba Command Center
   como `premium/HOLD`; se reconstruyó desde las fuentes actuales.
2. El pipeline fijaba una fecha histórica de generación; ahora registra una fecha
   UTC real para que `STALE` sea significativo.
3. El snapshot aislado con `schema_version: unavailable` ya no se representa como
   una colección vacía saludable: API y adapter lo muestran como `UNAVAILABLE`.
4. La UI de Services quedó explícitamente de solo lectura; no contiene acciones
   que ejecuten `aos up`, `aos down` o `aos restart`.
5. Products muestra tier y URL canónica únicamente cuando proceden de Knowledge;
   no construye URLs por coincidencia de nombres.
6. La consulta AKG histórica TQ-23 se actualizó para comprobar `ACTIVE` tras
   CHG-0019, conservando la trazabilidad del cambio en Vault.

## Matriz de sincronización

| Fuente | Estado | Divergencias | Acción | Autorización requerida |
| --- | --- | --- | --- | --- |
| `anclora-vault` | READY | El registry no tenía URL pública de CleanSheet | Añadida la URL respaldada por el contrato SecureFlow vigente | La modificación queda documentada aquí; revisión de gobernanza antes de merge |
| `anclora-governance` | READY | Sin contradicción activa relevante para esta implementación | Solo lectura | No |
| `anclora-infrastructure` | READY tras rebuild | Knowledge generado histórico y query TQ-23 obsoleta | Pipeline, test y artefacto regenerados | Revisión antes de merge |
| `anclora-command-center` | READY_FOR_REVIEW | La UI anterior conservaba rutas de acción aunque estaban deshabilitadas | Adapter, API guard, contratos, UI, tests y auditoría actualizados | No promoción automática |
| `anclora-group` | OBSERVADO | Ya contiene el contrato SecureFlow y el fallback canónico de CleanSheet | Sin cambios | No |
| `anclora-group-landing` | OBSERVADO | No afecta a la consola interna | Sin cambios | No |
| `anclora-design-system` | OBSERVADO | No afecta a la normalización de datos | Sin cambios | No |

## SecureFlow y Command Center

El modelo regenerado contiene exactamente estos cuatro productos SecureFlow:

- `product:filestudio`
- `product:purgedoc`
- `product:tableextractor`
- `product:clearsheet`

Command Center permanece fuera del catálogo público: está registrado como
`internal/ACTIVE`, no como producto SecureFlow ni como producto público.

## Validación ejecutada

- `npm run validate:contracts`: PASS — build `17a17c9f7a39f8ed`, cuatro productos
  SecureFlow y URL de CleanSheet verificados.
- `npm run lint`: PASS.
- `npm test`: PASS — 14 suites, 186 tests y 66 pruebas del servidor.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- `aos status --json`: PASS con contrato AOS `1.1`; Command Center configurado,
  actualmente `stopped`, sin cambiar ese estado operativo.
- QA visual local con `agent-browser`: PASS — la SPA carga, no presenta overlay
  de error ni errores de consola; Overview y Products renderizan correctamente.

La suite de Knowledge de Infrastructure se ejecutó con el entorno local y
detectó dos asunciones históricas ya desactualizadas (release FileStudio
`v1.0.1` y Calculadora Fiscal como producto sin AOS); ambas pruebas se
actualizaron a los hechos actuales. La reconstrucción y la validación del
modelo pasan con el dataset actual.

Estado final: `READY_FOR_REVIEW`.

Este trabajo no incluye commit, push, promoción ni despliegue.
