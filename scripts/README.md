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

## Relacionado

- [[AGENTS]]
- [[CLAUDE]]
- [[Mapa del Sistema de Agentes]]
