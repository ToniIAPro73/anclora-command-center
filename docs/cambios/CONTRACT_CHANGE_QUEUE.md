# Contract Change Queue

## Objetivo

Registrar cambios contractuales pendientes de propagación y seguimiento.

## Estados

- `PENDING`
- `IN_PROGRESS`
- `PROPAGATED`
- `CLOSED`

## Tipos de cambio

- `CREATE`
- `MODIFY`
- `DELETE`

## Ámbitos

- `UNIVERSAL`
- `INTERNAL`
- `PREMIUM`
- `ULTRA_PREMIUM`
- `PORTFOLIO`
- `APP_ONLY`

## Cola activa

| ID | Fecha | Contrato(s) | Condición(es) | Tipo | Ámbito | Cambio | Repo fuente | Repos destino | Acción de propagación | Estado | Aplicado en | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `CHG-0002` | 2026-03-30 | `CONTRACT_CONDITION_CATALOG.md` + `CONTRACT_COMPLIANCE_MATRIX.md` + `APPLICATION_FAMILY_MAP.md` | `M1-M6`, `D1-D6`, `L1-L5`, `I1-I3`, `P1-P5`, `U1-U3`, `S1-S3` | `MODIFY` | `UNIVERSAL` + `INTERNAL` + `PREMIUM` + `ULTRA_PREMIUM` + `PORTFOLIO` | Convertir la gobernanza contractual en tablas operativas de condiciones, familias y cumplimiento; añadir campos de propagación explícitos para el seguimiento de cambios. | `Boveda-Anclora` | `Boveda-Anclora` | Actualizar bóveda; si algún contrato base cambia, propagar después a familias afectadas y actualizar la matriz | `IN_PROGRESS` | `Boveda-Anclora` | Infraestructura de gobierno reforzada |

## Regla de cierre

Un cambio sólo puede pasar a `CLOSED` cuando:

1. la bóveda está actualizada
2. los repos afectados están sincronizados
3. la matriz de cumplimiento se ha actualizado si aplica
4. la acción de propagación ya no tiene pendientes

No se deben borrar filas cerradas. Deben pasar a histórico.
