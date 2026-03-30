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

## Regla de cierre

Un cambio sólo puede pasar a `CLOSED` cuando:

1. la bóveda está actualizada
2. los repos afectados están sincronizados
3. la matriz de cumplimiento se ha actualizado si aplica
4. la acción de propagación ya no tiene pendientes

No se deben borrar filas cerradas. Deben pasar a histórico.
