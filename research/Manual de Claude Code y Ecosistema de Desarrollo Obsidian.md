### 💻 Comandos de Terminal (CLI) de Claude Code

* **claude**: Inicia la sesión interactiva local (REPL) dentro del directorio de tu proyecto 1, 2\.  
* **claude \-p / claude \--print**: Ejecuta una tarea puntual, muestra la respuesta estructurada y se cierra. Ideal para scripts de CI/CD o consultas rápidas 3, 4\.  
* **claude \--worktree / \-w**: Inicia Claude en un *git worktree* aislado, permitiendo ejecutar múltiples agentes en paralelo sin conflictos de código 5, 6\.  
* **claude \--resume / claude \-c**: Abre un selector o retoma instantáneamente tu última conversación en el directorio actual 7, 8\.  
* **claude \--dangerously-skip-permissions**: Inicia omitiendo las confirmaciones de seguridad. Solo recomendado si usas un flujo estricto de ramas en Git 9\.  
* **claude doctor**: Ejecuta una herramienta de diagnóstico para verificar que tu entorno y claves API estén configurados correctamente 1, 10\.

### ⚡ Slash Commands Más Útiles (Interactivos)

* **/init**: Escanea el proyecto actual y genera un archivo CLAUDE.md inicial, que servirá como memoria persistente para el agente 1, 11\.  
* **/plan**: Activa el *Plan Mode*, ideal para hacer que la IA razone, lea y genere un plan de acción para refactorizaciones complejas antes de escribir código 12, 13\.  
* **/clear**: Purga la caché de contexto de la sesión actual, fundamental para evitar que Claude mezcle código o se confunda de contexto 12, 14\.  
* **/compact**: Resume y compacta el historial activo reteniendo instrucciones clave, salvando tu sesión cuando te quedas sin tokens de contexto 15, 16\.  
* **/resume**: Permite cambiar de contexto cargando registros de sesiones o proyectos anteriores 14, 17, 18\.  
* **/permissions**: Abre la configuración para que apruebes o deniegues automáticamente herramientas o comandos Bash específicos 19, 20\.  
* **/loop**: Inicia un programador de tareas en segundo plano (estilo cron) útil para automatizar la revisión de Pull Requests o monitorear despliegues 21, 22\.  
* **/agents**: Crea, define y lista sub-agentes especializados para delegar partes del proyecto 23\.

### 🔌 Plugins de Obsidian Indispensables para Desarrolladores

Para utilizar Obsidian como bóveda de desarrollo sin ensuciar la interfaz con archivos de código basura, la "Complete Integration Guide" de Starmorph recomienda las siguientes herramientas:  
**Para filtrar y gestionar vistas de desarrollo:**

* **File Explorer++**: Fundamental para limpiar el desorden visual. Permite filtrar mediante *wildcards* o *regex* para ocultar extensiones de código como \*.js, \*.png o la carpeta node\_modules 24-26.  
* **Dataview**: Permite consultar metadatos a lo largo de toda tu bóveda, listar planes de Claude por su estado, y consultar dinámicamente tus diferentes CLAUDE.md 26, 27\.  
* **Templater**: Ideal para automatizar la creación de plantillas de archivos CLAUDE.md con secciones estándar y variables 26\.  
* **Folder Note**: Permite adjuntar una nota markdown descriptiva directamente a una carpeta, abriéndola automáticamente al hacer clic en el directorio 26\.  
* **File Hider**: Te da la opción de hacer clic derecho sobre archivos o carpetas individuales para ocultarlos manualmente de la vista 26\.  
* **Hide Folders**: Proporciona un control de visibilidad de carpetas basado en patrones dentro del navegador de archivos 26\.

**Para la Integración con Claude Code:**

* **Claudian**: Incrusta a Claude Code directamente en la interfaz de Obsidian (como un chat en la barra lateral) con modos de permiso (YOLO/Safe/Plan) integrados, para quienes no quieren salir de su editor Markdown 26, 28\.  
* **obsidian-claude-code-mcp**: Un servidor puente MCP que permite a Claude Code descubrir tus bóvedas a través de WebSocket, otorgándole capacidad de búsqueda y lectura directa sin necesidad de usar tu bóveda como directorio de trabajo activo en la terminal 26, 29, 30\.

