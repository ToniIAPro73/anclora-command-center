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
