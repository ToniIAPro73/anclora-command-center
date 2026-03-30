# Contract Compliance Matrix

## Objetivo

Servir de checklist maestra de cumplimiento por aplicación, agrupada por familia, contrato y nivel de evidencia.

Estados permitidos:
- `OK`
- `PARTIAL`
- `NO`
- `N/A`

Interpretación operativa:
- `OK`: auditado y sin gaps abiertos relevantes en el alcance revisado
- `PARTIAL`: auditado de forma parcial o con gaps todavía abiertos
- `NO`: incumplimiento confirmado o cobertura todavía insuficiente para aceptar el contrato
- `N/A`: el contrato o condición no aplica a esa app

La referencia de condiciones es:
- `docs/governance/CONTRACT_CONDITION_CATALOG.md`

## Vista resumida por aplicación

| Aplicación | Familia | Universal Motion | Universal Modal | Universal Localization | Family Contract | Overrides locales | Cobertura auditada | Estado global | Gaps abiertos | Última auditoría |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `anclora-group` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría pantalla por pantalla | PARTIAL | Falta auditoría visual real de shell, toggles, modales y responsive | 2026-03-30 |
| `anclora-advisor-ai` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría pantalla por pantalla | PARTIAL | Falta auditoría visual real de shell, toggles, modales y responsive | 2026-03-30 |
| `anclora-nexus` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría pantalla por pantalla | PARTIAL | Falta auditoría visual real de shell, toggles, modales y responsive | 2026-03-30 |
| `anclora-content-generator-ai` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría pantalla por pantalla | PARTIAL | Falta auditoría visual real de shell, toggles, modales y responsive | 2026-03-30 |
| `anclora-impulso` | Premium | PARTIAL | OK | PARTIAL | PARTIAL | N/A | Dashboard, Nutrition, Workouts, Profile, Progress y Gamificación auditados en local; producción parcial | PARTIAL | Falta pass final completo en producción y cierre fino de coherencia premium entre superficies | 2026-03-30 |
| `Boveda-Anclora/dashboard` | Premium | PARTIAL | N/A | PARTIAL | PARTIAL | N/A | Home principal auditada en desktop/móvil; vistas secundarias pendientes | PARTIAL | Falta auditoría completa de vistas secundarias y coherencia fina de cards premium | 2026-03-30 |
| `anclora-data-lab` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Login y backoffice `access-requests` auditados en desktop/móvil; workspace pendiente | PARTIAL | Falta auditoría completa del workspace y cierre de coherencia premium de cards/surfaces | 2026-03-30 |
| `anclora-synergi` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Login y backoffice `partner-admissions` auditados en desktop/móvil; resto del backoffice parcial | PARTIAL | Falta auditoría completa del backoffice y cierre de coherencia premium de cards/surfaces | 2026-03-30 |
| `anclora-private-estates` | Ultra Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | Contratos sincronizados; falta auditoría editorial y validación de overrides | PARTIAL | Falta auditoría visual detallada y validación de overrides ultra premium | 2026-03-30 |
| `anclora-portfolio` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría detallada | PARTIAL | Falta auditoría visual y de conversión en desktop/móvil | 2026-03-30 |
| `anclora-azure-bay-landing` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría detallada | PARTIAL | Falta auditoría visual y de conversión en desktop/móvil | 2026-03-30 |
| `anclora-playa-viva-uniestate` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría detallada | PARTIAL | Falta auditoría visual y de conversión en desktop/móvil | 2026-03-30 |

## Evidencia resumida por familia

### Premium

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-impulso` | Flujos autenticados auditados mayoritariamente en local; producción validada de forma parcial | Diferencias finas entre local y Vercel y coherencia premium entre cards/surfaces | Ejecutar pass completo en producción y cerrar criterios de cards premium |
| `Boveda-Anclora/dashboard` | Home principal auditada y responsive corregido | Vistas secundarias no auditadas y densidad móvil todavía justa | Auditar todas las vistas y fijar patrón premium de cards |
| `anclora-data-lab` | Login y backoffice de accesos auditados; claro/oscuro e i18n corregidos | Workspace pendiente y cards premium todavía sin criterio final de grupo | Auditar workspace y cerrar criterio de cards premium |
| `anclora-synergi` | Login y backoffice de admisiones auditados; claro/oscuro e i18n corregidos | Backoffice completo pendiente y cards premium todavía sin criterio final de grupo | Auditar resto del backoffice y cerrar criterio de cards premium |

### Internal

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-group` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría end-to-end de shell y pantallas principales |
| `anclora-advisor-ai` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría end-to-end de shell y pantallas principales |
| `anclora-nexus` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría end-to-end de shell y pantallas principales |
| `anclora-content-generator-ai` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría end-to-end de shell y pantallas principales |

### Ultra Premium

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-private-estates` | Sólo sincronización contractual | Overrides no validados y falta de auditoría editorial | Auditoría ultra premium pantalla por pantalla |

### Portfolio / Showcase

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-portfolio` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría de narrativa, CTA, responsive y conversión |
| `anclora-azure-bay-landing` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría de narrativa, CTA, responsive y conversión |
| `anclora-playa-viva-uniestate` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría de narrativa, CTA, responsive y conversión |

## Vista detallada por contrato

### Universal · UI Motion

| Aplicación | M1 | M2 | M3 | M4 | M5 | M6 |
| --- | --- | --- | --- | --- | --- | --- |
| `anclora-group` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-impulso` | PARTIAL | PARTIAL | OK | PARTIAL | PARTIAL | OK |
| `Boveda-Anclora/dashboard` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-data-lab` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Universal · Modal

| Aplicación | D1 | D2 | D3 | D4 | D5 | D6 |
| --- | --- | --- | --- | --- | --- | --- |
| `anclora-group` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-impulso` | OK | OK | PARTIAL | OK | OK | OK |
| `Boveda-Anclora/dashboard` | N/A | N/A | N/A | N/A | N/A | N/A |
| `anclora-data-lab` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Universal · Localization

| Aplicación | L1 | L2 | L3 | L4 | L5 |
| --- | --- | --- | --- | --- | --- |
| `anclora-group` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-impulso` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `Boveda-Anclora/dashboard` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-data-lab` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Family · Internal

| Aplicación | I1 | I2 | I3 |
| --- | --- | --- | --- |
| `anclora-group` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL |

### Family · Premium

| Aplicación | P1 | P2 | P3 | P4 | P5 |
| --- | --- | --- | --- | --- | --- |
| `anclora-impulso` | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL |
| `Boveda-Anclora/dashboard` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-data-lab` | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL |

### Family · Ultra Premium

| Aplicación | U1 | U2 | U3 |
| --- | --- | --- | --- |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL |

### Family · Portfolio / Showcase

| Aplicación | S1 | S2 | S3 |
| --- | --- | --- | --- |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL |

## Gaps confirmados que ya están registrados

| ID | Ámbito | Aplicaciones | Gap |
| --- | --- | --- | --- |
| `CHG-0003` | `PREMIUM` | `anclora-impulso`, `anclora-data-lab`, `anclora-synergi`, `Boveda-Anclora/dashboard` | Falta decidir si la coherencia visual de cards premium debe pasar a contrato de familia o resolverse como ajustes locales por app |

## Uso

Cuando se cierre una auditoría o una propagación contractual:

1. actualizar la fila resumida de la app
2. actualizar el bloque detallado del contrato afectado
3. actualizar `Cobertura auditada` y `Gaps abiertos`
4. actualizar `Última auditoría`
5. regenerar `docs/governance/CONTRACT_ACTION_PLAN.md` si el cambio altera prioridades o acciones

La matriz mide cumplimiento. No sustituye a los contratos.
