# Contract Compliance Matrix

## Objetivo

Servir de checklist maestra de cumplimiento por aplicación, agrupada por familias y por contratos.

Estados permitidos:
- `OK`
- `PARTIAL`
- `NO`
- `N/A`

## Condiciones agrupadas por contratos

### Universal · UI Motion

- `M1` Elevación y hover consistentes entre cards equivalentes
- `M2` Borde/foco legible y coherente con el tema
- `M3` CTA primario/ secundario/ destructivo con semántica estable
- `M4` Sin clipping visual al elevar cards o surfaces

### Universal · Modal

- `D1` Cierre superior derecho claro
- `D2` Acciones principales visibles en la parte inferior
- `D3` Sin scroll vertical u horizontal evitable
- `D4` Validación visual obligatoria en escritorio y móvil antes de publicar

### Universal · Localization

- `L1` Todos los idiomas objetivo realmente visibles, no sólo toggle cosmético
- `L2` Sin mezcla de idiomas dentro de la misma experiencia
- `L3` Sin hardcoded strings de producto donde debe haber i18n

### Family · Internal

- `I1` Shell funcional y denso, priorizando claridad operativa
- `I2` Toggles visibles de idioma/tema cuando el contrato de la app lo exija

### Family · Premium

- `P1` Tratamiento visual premium consistente entre topbar, hero, cards y filtros
- `P2` Densidad controlada en móvil, sin sacrificar jerarquía
- `P3` Ritmo visual y aire suficientes en claro y oscuro
- `P4` Tono de marca premium sin romper la semántica universal

### Family · Ultra Premium

- `U1` Presentación de muy alto nivel editorial
- `U2` Overrides de marca documentados y controlados

### Family · Portfolio

- `S1` Prioridad a conversión, narrativa visual y captación
- `S2` Navegación y CTA de showcase coherentes entre landings

## Matriz

| Aplicación | Familia | M1 | M2 | M3 | M4 | D1 | D2 | D3 | D4 | L1 | L2 | L3 | Familia | Estado | Gaps abiertos | Última auditoría |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `anclora-group` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`I1`,`I2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-advisor-ai` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`I1`,`I2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-nexus` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`I1`,`I2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-content-generator-ai` | Internal | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`I1`,`I2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-impulso` | Premium | PARTIAL | PARTIAL | OK | PARTIAL | OK | OK | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`P1`,`P2`,`P3`,`P4`) | PARTIAL | Faltan rondas completas pantalla por pantalla y pass final de producción | 2026-03-30 |
| `Boveda-Anclora/dashboard` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | N/A | N/A | N/A | OK | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`P1`,`P2`,`P3`,`P4`) | PARTIAL | Falta auditoría completa de vistas secundarias | 2026-03-30 |
| `anclora-data-lab` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`P1`,`P2`,`P3`,`P4`) | PARTIAL | Falta auditoría completa del backoffice | 2026-03-30 |
| `anclora-synergi` | Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | OK | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`P1`,`P2`,`P3`,`P4`) | PARTIAL | Falta auditoría completa del backoffice | 2026-03-30 |
| `anclora-private-estates` | Ultra Premium | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`U1`,`U2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-portfolio` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`S1`,`S2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-azure-bay-landing` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`S1`,`S2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |
| `anclora-playa-viva-uniestate` | Portfolio / Showcase | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL (`S1`,`S2`) | PARTIAL | Pendiente de auditoría detallada | 2026-03-30 |

## Uso de la matriz

Cuando se cierre una auditoría o una propagación contractual:

1. actualizar la fila de la app afectada
2. actualizar `Gaps abiertos`
3. actualizar `Última auditoría`

La matriz no sustituye a los contratos. Sirve para medir cumplimiento.
