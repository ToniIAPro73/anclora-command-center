# Contract Action Plan

## Objetivo

Convertir la matriz de cumplimiento en una lista priorizada de acciones para la bóveda.

Estados prioritarios del plan:
- P10 y menores: más urgentes
- El score favorece apps premium y ultra premium antes que internal y portfolio

## Resumen por familia

| Familia | Apps | OK | PARTIAL | NO |
| --- | --- | --- | --- | --- |
| `Internal` | 4 | 0 | 4 | 0 |
| `Portfolio / Showcase` | 3 | 0 | 3 | 0 |
| `Premium` | 4 | 0 | 4 | 0 |
| `Ultra Premium` | 1 | 0 | 1 | 0 |

## Plan priorizado

| Prioridad | Aplicación | Familia | Estado | Gap abierto | Próxima acción | Última auditoría |
| --- | --- | --- | --- | --- | --- | --- |
| `P7` | `anclora-impulso` | Premium | PARTIAL | Falta cierre pantalla por pantalla y pass final de producción | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P8` | `anclora-data-lab` | Premium | PARTIAL | Falta auditoría completa del backoffice y workspace | Recorrer todas las rutas del backoffice/workspace y cerrar i18n, tema y layout. | 2026-03-30 |
| `P8` | `anclora-synergi` | Premium | PARTIAL | Falta auditoría completa del backoffice | Auditar todas las rutas del backoffice y corregir inconsistencias residuales. | 2026-03-30 |
| `P8` | `Boveda-Anclora/dashboard` | Premium | PARTIAL | Falta auditoría completa de vistas secundarias | Cerrar auditoría visual desktop/móvil y validar contratos premium comunes. | 2026-03-30 |
| `P17` | `anclora-private-estates` | Ultra Premium | PARTIAL | Falta auditoría detallada y validación de overrides | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P28` | `anclora-advisor-ai` | Internal | PARTIAL | Falta auditoría detallada por pantallas | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P28` | `anclora-content-generator-ai` | Internal | PARTIAL | Falta auditoría detallada por pantallas | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P28` | `anclora-group` | Internal | PARTIAL | Falta auditoría detallada por pantallas | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P28` | `anclora-nexus` | Internal | PARTIAL | Falta auditoría detallada por pantallas | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P38` | `anclora-azure-bay-landing` | Portfolio / Showcase | PARTIAL | Falta auditoría detallada | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P38` | `anclora-playa-viva-uniestate` | Portfolio / Showcase | PARTIAL | Falta auditoría detallada | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |
| `P38` | `anclora-portfolio` | Portfolio / Showcase | PARTIAL | Falta auditoría detallada | Ejecutar auditoría visual pantalla por pantalla en escritorio y móvil. | 2026-03-30 |

## Uso

1. Revisar primero las filas con prioridad más baja (P10, P11, etc.).
2. Abrir o actualizar la entrada correspondiente en docs/cambios/CONTRACT_CHANGE_QUEUE.md si el gap requiere propagación.
3. Ejecutar la auditoría o la corrección en la app afectada.
4. Actualizar la matriz y cerrar el gap cuando la validación visual y contractual quede completa.

La matriz mide cumplimiento; este documento convierte el cumplimiento en trabajo pendiente.
