# Contract Change Queue

## Objetivo

Registrar cambios contractuales detectados, analizarlos, decidir su alcance y, solo cuando proceda, propagarlos.

## Estados

- `DETECTED`
- `ANALYSIS_REQUIRED`
- `PLAN_READY`
- `APPROVED`
- `IN_PROGRESS`
- `VERIFYING`
- `CLOSED`
- `REJECTED`
- `APP_ONLY`

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

| ID | Fecha | Contrato(s) | Condición(es) | Tipo | Ámbito | Cambio | Repo fuente | Repos destino | Acción de propagación | Estado | Decision | Aprobado por | Aprobado en | Plan de accion | Aplicado en | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `CHG-0003` | 2026-03-30 | `UI_MOTION_CONTRACT.md` + `ANCLORA_PREMIUM_APP_CONTRACT.md` | `M1`, `M2`, `M3`, `P1`, `P3` | `MODIFY` | `PREMIUM` | Unificar el tratamiento visual de cards premium para eliminar desalineación cromática entre Impulso, Data Lab, Synergi y dashboard de la bóveda. | `Boveda-Anclora` | `anclora-impulso` + `anclora-data-lab` + `anclora-synergi` + `Boveda-Anclora/dashboard` | Actualizar contrato premium y motion si procede; validar impacto, aprobar y propagar sólo a premium. | `ANALYSIS_REQUIRED` | `` | `` | `` | `docs/cambios/revisiones/CHG-0003.md` | `` | Detectado como gap visual pequeño pero fácil de perder entre apps premium. |

## Regla de cierre

Un cambio sólo puede pasar a `CLOSED` cuando:

1. la bóveda está actualizada
2. los repos afectados están sincronizados
3. la matriz de cumplimiento se ha actualizado si aplica
4. la accion de propagacion ya no tiene pendientes
5. la verificacion final ha concluido correctamente

## Regla de decision

- `DETECTED` y `ANALYSIS_REQUIRED`: la boveda detecta el cambio y espera analisis
- `PLAN_READY`: el plan existe, pero no se ejecuta todavia
- `APPROVED`: el cambio queda autorizado para ejecutar
- `APP_ONLY`: el cambio se considera local y no modifica contratos de ecosistema
- `REJECTED`: el cambio se descarta

La presencia del cambio en la cola no implica autorizacion automatica.

No se deben borrar filas cerradas. Deben pasar a histórico.
