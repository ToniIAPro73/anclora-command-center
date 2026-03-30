# Scripts

Esta carpeta contiene utilidades de mantenimiento del repositorio que no forman parte directa del contenido de la bóveda, pero sí de su operativa.

## `sync-skills.ps1`

Sincroniza `.claude/skills/` desde `.codex/skills/`.

### Cuándo usarlo

- Cuando se actualiza una skill canónica en `.codex/skills/`
- Cuando se quiere mantener compatibilidad con herramientas o agentes que esperan `.claude/skills/`

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-skills.ps1 -Clean
```

### Nota

La fuente canónica de skills del repositorio es `.codex/skills/`. La carpeta `.claude/skills/` se considera una capa de compatibilidad.

## `start-weekly-review.ps1`

Prepara la revisión semanal completa con baja fricción.

### Qué hace

- crea la nota diaria del día si no existe
- añade los bloques `## 🧹 Mantenimiento de Bóveda` y `## 🐙 Estado Semanal de Repositorios`
- actualiza un bloque visible `## 🤖 Resultado de tarea automática` dentro de la daily note
- escribe un rastro técnico en `logs/weekly-review.log`
- sincroniza skills antes de empezar
- deja lista la sesión para ejecutar el playbook semanal
- intenta mostrar una notificación ligera de Windows al terminar

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-weekly-review.ps1
```

### Recomendación

Úsalo cada viernes a las 15:00 como punto de entrada para la revisión semanal completa.

## `register-weekly-review-task.ps1`

Registra una tarea programada de Windows para lanzar la revisión semanal automáticamente.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-weekly-review-task.ps1
```

### Comportamiento por defecto

- nombre de tarea: `Anclora Weekly Review`
- día: viernes
- hora: `15:00`

### Parámetros opcionales

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-weekly-review-task.ps1 -TaskName "Mi Revision" -Day Friday -Time 15:00
```

## `unregister-weekly-review-task.ps1`

Elimina la tarea programada si quieres dejar de usar la automatización.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\unregister-weekly-review-task.ps1
```

## `process-contract-change-queue.ps1`

Procesa la cola de cambios contractual y distingue entre:
- propagaciones de contratos de `docs/standards/`
- cambios de gobernanza de `docs/governance/`
- cambios de seguimiento de `docs/cambios/`

Solo ejecuta cambios con:
- `Status = APPROVED`, `IN_PROGRESS` o `VERIFYING`
- y decision compatible con ejecucion

### Cuándo usarlo

- Cuando hay entradas activas en `docs/cambios/CONTRACT_CHANGE_QUEUE.md`
- Cuando se quiere simular el impacto con `-WhatIfOnly`
- Cuando se quiere ejecutar la propagación por familia sin hacerlo manualmente contrato a contrato

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\process-contract-change-queue.ps1 -WhatIfOnly
```

### Nota

Los cambios de gobernanza se dejan dentro de la bóveda y no se propagan a repos de aplicaciones.
Los cambios en `DETECTED`, `ANALYSIS_REQUIRED` o `PLAN_READY` se listan, pero no se ejecutan.

## `detect-contract-changes.ps1`

Detecta cambios en los contratos maestros de `docs/standards/` comparando hashes con el ultimo snapshot conocido.

### Cuándo usarlo

- Cuando quieres saber si ha cambiado algun contrato maestro
- Antes de procesar la cola de cambios
- Como primer paso del ciclo diario

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\detect-contract-changes.ps1 -WhatIfOnly
```

### Salida

- registra cambios nuevos en `docs/cambios/CONTRACT_CHANGE_QUEUE.md`
- actualiza `logs/contract-standards-state.json`
- deja los cambios nuevos en `ANALYSIS_REQUIRED`
- en la primera ejecucion real crea un baseline y no abre cambios

## `run-contract-governance-cycle.ps1`

Ejecuta el ciclo diario de gobierno contractual de extremo a extremo.

### Que hace

- detecta cambios en contratos maestros
- procesa la cola solo para cambios aprobados
- audita sincronizacion contractual
- escribe un rastro tecnico en `logs/contract-governance.log`
- intenta mostrar una notificacion ligera al terminar

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-contract-governance-cycle.ps1
```

## `register-daily-contract-governance-task.ps1`

Registra una tarea programada diaria para ejecutar el ciclo de gobierno contractual.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-daily-contract-governance-task.ps1
```

### Comportamiento por defecto

- nombre de tarea: `Anclora Daily Contract Governance`
- frecuencia: diaria
- hora: `09:00`

## `unregister-daily-contract-governance-task.ps1`

Elimina la tarea programada diaria del ciclo contractual.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\unregister-daily-contract-governance-task.ps1
```

## `send-contract-governance-reminder.ps1`

Lee la cola de cambios y envia un recordatorio solo si hay cambios pendientes.

### Comportamiento

- si no hay pendientes, no envia nada
- si hay configuracion SMTP, envia email
- si no hay SMTP, lanza una notificacion local como fallback

### Variables soportadas

- `CONTRACT_GOVERNANCE_EMAIL_TO`
- `CONTRACT_GOVERNANCE_EMAIL_FROM`
- `CONTRACT_GOVERNANCE_SMTP_HOST`
- `CONTRACT_GOVERNANCE_SMTP_PORT`
- `CONTRACT_GOVERNANCE_SMTP_USER`
- `CONTRACT_GOVERNANCE_SMTP_PASS`
- `CONTRACT_GOVERNANCE_SMTP_SSL`

Tambien puede leerlas desde `.env.local`, que queda ignorado por Git.
Si no se definen, intenta reutilizar la configuracion SMTP ya usada por Nexus:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `SMTP_USE_SSL`
- `SMTP_USE_TLS`

Defaults si no se definen:
- `CONTRACT_GOVERNANCE_EMAIL_FROM = Anclora Alerts <antonio@anclora.com>`
- `CONTRACT_GOVERNANCE_EMAIL_TO = antonio@anclora.com`

### Asunto por defecto

Sigue el mismo patron operativo de Nexus:

```text
[Anclora] Contract Governance pendiente - {abiertos} abiertos / {estancados} estancados - {fecha}
```

Ejemplo:

```text
[Anclora] Contract Governance pendiente - 2 abiertos / 1 estancado - 30/3/26, 9:15:00
```

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\send-contract-governance-reminder.ps1 -WhatIfOnly
```

## `register-contract-governance-reminder-task.ps1`

Registra una tarea diaria para enviar el recordatorio de cambios pendientes.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-contract-governance-reminder-task.ps1
```

### Comportamiento por defecto

- nombre de tarea: `Anclora Contract Governance Reminder`
- frecuencia: diaria
- hora: `09:15`

## `unregister-contract-governance-reminder-task.ps1`

Elimina la tarea programada del recordatorio contractual.

### Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\unregister-contract-governance-reminder-task.ps1
```

## Relacionado

- [[AGENTS]]
- [[CLAUDE]]
- [[Mapa del Sistema de Agentes]]
