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
| `anclora-group` | Entidad Matriz | PARTIAL | PARTIAL | PARTIAL | N/A | PARTIAL | Portal corporativo con branding propio; contratos de entidad matriz y branding recién alineados en bóveda | PARTIAL | Falta auditoría visual completa del repo real y cierre de assets finales si aplica | 2026-04-04 |
| `anclora-advisor-ai` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Branding interno estructural alineado en el repo real: módulo centralizado de marca, metadata y favicon wiring preparado; assets finales y paleta definitiva pendientes | PARTIAL | Falta auditoría visual real de shell, toggles, modales y responsive; assets finales pendientes | 2026-04-04 |
| `anclora-nexus` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Nota canónica actualizada y repo real alineado en branding dark, metadata, tipografía e i18n explícito `es/en/de/ru` | PARTIAL | Quedan pendientes los assets definitivos de logo/favicon del usuario y una auditoría visual pantalla por pantalla | 2026-04-04 |
| `anclora-content-generator-ai` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría pantalla por pantalla | PARTIAL | Falta auditoría visual real de shell, toggles, modales y responsive | 2026-03-30 |
| `anclora-impulso` | Premium | PARTIAL | OK | PARTIAL | PARTIAL | N/A | Branding premium estructural alineado en el repo real: DM Sans, wiring centralizado de marca, metadata y paleta naranja/cobre; assets finales pendientes | PARTIAL | Falta pass final completo en producción y cierre fino de coherencia premium entre superficies | 2026-04-04 |
| `anclora-command-center` | Premium | PARTIAL | N/A | PARTIAL | PARTIAL | N/A | Shell compartida y vistas `command-center` y `real-estate` ya unificadas; falta auditoría contractual completa | PARTIAL | Falta auditoría completa de las dos vistas del app unificado y cierre fino de coherencia premium | 2026-04-04 |
| `anclora-data-lab` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Branding premium estructural alineado en el repo real: DM Sans, wiring centralizado de marca, metadata y paleta esmeralda/cobre; assets finales pendientes | PARTIAL | Faltan los assets finales de logo/favicon del usuario y una auditoría visual completa del workspace para cerrar el contrato premium más allá del branding | 2026-04-04 |
| `anclora-synergi` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Branding premium estructural alineado en el repo real: DM Sans, wiring centralizado de marca, metadata y paleta púrpura/cobre; assets finales pendientes | PARTIAL | Faltan los assets finales de logo/favicon del usuario y una auditoría visual completa del backoffice para cerrar el contrato premium más allá del branding | 2026-04-04 |
| `anclora-talent` | Premium | PARTIAL | N/A | PARTIAL | PARTIAL | N/A | Clasificada como premium en bóveda; landing, auth y workspace con contrato dark-first e i18n es/en en progreso de cierre | PARTIAL | Falta auditoría visual completa y cierre de persistencia de tema/idioma en toda la app | 2026-04-02 |
| `anclora-private-estates` | Ultra Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | Contratos sincronizados; falta auditoría editorial y validación de overrides | PARTIAL | Falta auditoría visual detallada y validación de overrides ultra premium | 2026-03-30 |
| `anclora-private-estates-landing-page` | Ultra Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | Landing pública clasificada como ultra premium; existe plan de refinamiento dark-only e i18n, pero falta auditoría contractual cerrada | PARTIAL | Falta auditoría visual detallada, validación de overrides y cierre de la capa pública ultra premium | 2026-04-03 |
| `anclora-portfolio` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría detallada | PARTIAL | Falta auditoría visual y de conversión en desktop/móvil | 2026-03-30 |
| `anclora-azure-bay-landing` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría detallada | PARTIAL | Falta auditoría visual y de conversión en desktop/móvil | 2026-03-30 |
| `anclora-playa-viva-uniestate` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | Contratos sincronizados; falta auditoría detallada | PARTIAL | Falta auditoría visual y de conversión en desktop/móvil | 2026-03-30 |

## Evidencia resumida por familia

### Entidad Matriz

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-group` | Portal corporativo clasificado como Entidad Matriz; nota canónica y gobernanza ya regularizadas en bóveda | Falta validar el repo real contra los contratos nuevos de branding | Auditar el repo `anclora-group` y cerrar wiring de tokens, favicon y metadata |

### Premium

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-impulso` | Branding premium estructural alineado en el repo real: DM Sans, wiring centralizado de marca, metadata y paleta naranja/cobre; assets finales pendientes | Diferencias finas entre local y Vercel y coherencia premium entre cards/surfaces | Ejecutar pass completo en producción y cerrar criterios de cards premium |
| `anclora-command-center` | Shell compartida activa; Command Center y `real-estate` ya operan dentro del mismo app | Falta pass contractual completo de ambas vistas y validación fina de densidad/card hierarchy | Auditar el app unificado completo y cerrar criterios premium de ambas vistas |
| `anclora-data-lab` | Branding premium estructural ya alineado en el repo real con DM Sans, metadata centralizada y paleta esmeralda/cobre | Siguen pendientes los assets finales de marca y la auditoría visual completa del workspace | Sustituir logo/favicon cuando el usuario entregue assets y ejecutar pass visual completo del workspace |
| `anclora-synergi` | Branding premium estructural ya alineado en el repo real con DM Sans, metadata centralizada y paleta púrpura/cobre | Siguen pendientes los assets finales de marca y la auditoría visual completa del backoffice | Sustituir logo/favicon cuando el usuario entregue assets y ejecutar pass visual completo del backoffice |
| `anclora-talent` | Clasificada como premium en la bóveda; cuenta con shell, auth y dashboard definidos | Falta cierre visual y validación completa de dark default, theme toggle y locale toggle | Completar auditoría y cerrar contrato de preferencias e i18n en toda la app |

### Internal

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-advisor-ai` | Branding interno estructural alineado en el repo real: módulo centralizado de marca, metadata y favicon wiring preparado; assets finales pendientes | Siguen pendientes los assets finales de logo/favicon y la auditoría visual completa del shell y pantallas principales | Sustituir logo/favicon cuando el usuario entregue assets y ejecutar auditoría visual completa |
| `anclora-nexus` | Excepción multilenguaje documentada; frontend verificado con `lint`, `vitest` y `build`; branding dark e i18n explícito ya alineados | Faltan solo los assets finales de marca y un pass visual completo pantalla por pantalla | Sustituir logo/favicon cuando el usuario entregue assets finales y ejecutar auditoría visual completa |
| `anclora-content-generator-ai` | Sólo sincronización contractual | Sin evidencia visual real | Auditoría end-to-end de shell y pantallas principales |

### Ultra Premium

| Aplicación | Evidencia actual | Riesgo principal | Próxima acción |
| --- | --- | --- | --- |
| `anclora-private-estates` | Sólo sincronización contractual | Overrides no validados y falta de auditoría editorial | Auditoría ultra premium pantalla por pantalla |
| `anclora-private-estates-landing-page` | Plan de refinamiento dark-only e i18n existente; falta cierre contractual auditado | Capa pública ultra premium sin validación completa de responsive, localización y overrides | Auditoría ultra premium de landing pública y validación final de overrides |

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
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-impulso` | PARTIAL | PARTIAL | OK | PARTIAL | PARTIAL | OK |
| `anclora-command-center` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-data-lab` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-talent` | PARTIAL | N/A | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates-landing-page` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Universal · Modal

| Aplicación | D1 | D2 | D3 | D4 | D5 | D6 |
| --- | --- | --- | --- | --- | --- | --- |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-impulso` | OK | OK | PARTIAL | OK | OK | OK |
| `anclora-command-center` | N/A | N/A | N/A | N/A | N/A | N/A |
| `anclora-data-lab` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-talent` | N/A | N/A | N/A | N/A | N/A | N/A |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates-landing-page` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Universal · Localization

| Aplicación | L1 | L2 | L3 | L4 | L5 |
| --- | --- | --- | --- | --- | --- |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-impulso` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-command-center` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-data-lab` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-talent` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates-landing-page` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Family · Internal

| Aplicación | I1 | I2 | I3 |
| --- | --- | --- | --- |
| `anclora-advisor-ai` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-nexus` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-content-generator-ai` | PARTIAL | PARTIAL | PARTIAL |

### Family · Premium

| Aplicación | P1 | P2 | P3 | P4 | P5 |
| --- | --- | --- | --- | --- | --- |
| `anclora-impulso` | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL |
| `anclora-command-center` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `anclora-data-lab` | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL |
| `anclora-synergi` | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL |
| `anclora-talent` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

### Family · Ultra Premium

| Aplicación | U1 | U2 | U3 |
| --- | --- | --- | --- |
| `anclora-private-estates` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-private-estates-landing-page` | PARTIAL | PARTIAL | PARTIAL |

### Family · Portfolio / Showcase

| Aplicación | S1 | S2 | S3 |
| --- | --- | --- | --- |
| `anclora-portfolio` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-azure-bay-landing` | PARTIAL | PARTIAL | PARTIAL |
| `anclora-playa-viva-uniestate` | PARTIAL | PARTIAL | PARTIAL |

## Gaps confirmados que ya están registrados

| ID | Ámbito | Aplicaciones | Gap |
| --- | --- | --- | --- |
| `CHG-0003` | `PREMIUM` | `anclora-impulso`, `anclora-data-lab`, `anclora-synergi`, `anclora-command-center` | Falta decidir si la coherencia visual de cards premium debe pasar a contrato de familia o resolverse como ajustes locales por app |

## Uso

Cuando se cierre una auditoría o una propagación contractual:

1. actualizar la fila resumida de la app
2. actualizar el bloque detallado del contrato afectado
3. actualizar `Cobertura auditada` y `Gaps abiertos`
4. actualizar `Última auditoría`

La matriz mide cumplimiento. No sustituye a los contratos.
