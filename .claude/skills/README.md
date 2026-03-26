# Claude Skills Compatibility Layer

La fuente canonica de skills de este repositorio es `.codex/skills/`.

La carpeta `.claude/skills/` se mantiene como capa de compatibilidad para herramientas o agentes que esperan esa ruta.

No edites esta carpeta manualmente salvo necesidad puntual. Para actualizarla, sincroniza desde `.codex/skills/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-skills.ps1 -Clean
```
