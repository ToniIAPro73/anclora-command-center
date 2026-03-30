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

| ID | Fecha | Contrato | Tipo | Ámbito | Descripción | Repo fuente | Repos destino | Estado | Aplicado en | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Regla de cierre

Un cambio sólo puede pasar a `CLOSED` cuando:

1. la bóveda está actualizada
2. los repos afectados están sincronizados
3. la matriz de cumplimiento se ha actualizado si aplica

No se deben borrar filas cerradas. Deben pasar a histórico.
