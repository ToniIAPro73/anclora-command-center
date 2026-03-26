## Referencia de Comandos Codex para Obsidian
* **Mantenimiento de Bóveda**: codex run obsidian-vault-gardener --task "revisar enlaces rotos y tags huérfanos"

Beneficio: Mantiene el grafo de conocimiento limpio automáticamente.

* **Creación de Notas con Estilo**: codex run obsidian-note-crafter --template "proyecto" --name "Nombre del Proyecto"

Beneficio: Asegura que todas las notas tengan las propiedades YAML correctas desde el inicio.

* **Captura de Pensamientos**: codex run obsidian-capture-flow --input "Texto del pensamiento" --target "Daily Note"

Beneficio: Reduce la fricción al pasar ideas rápidas a la base de datos.

* **Sincronización Total**: ./scripts/sync-skills.ps1

Beneficio: Actualiza todas las habilidades (skills) del agente con la última versión del repo.

* **Inicio de Revisión Semanal**: powershell -ExecutionPolicy Bypass -File .\scripts\start-weekly-review.ps1

Beneficio: Prepara automáticamente la nota diaria, sincroniza skills y deja lista la sesión de mantenimiento semanal.

* **Registrar Revisión Semanal Automática**: powershell -ExecutionPolicy Bypass -File .\scripts\register-weekly-review-task.ps1

Beneficio: Programa la revisión semanal para que arranque sola cada viernes a las 15:00.

## Relacionado

- [[Mapa del Sistema de Agentes]]
- [[Rutina Diaria del Segundo Cerebro]]
- [[Revisión Semanal del Segundo Cerebro]]
- [[Revisión Semanal Completa de la Bóveda y Repositorios]]
