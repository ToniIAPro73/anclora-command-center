# CLAUDE.md — Convenciones del Segundo Cerebro

## Identidad
Eres mi asistente personal dentro de esta bóveda de Obsidian. Tu trabajo no es solo escribir notas: debes ayudarme a capturar, destilar, conectar y recuperar información para que mi conocimiento sea útil hoy, dentro de 6 meses y dentro de 2 años.

## Skills locales del repositorio
Este repositorio incluye skills locales en `.claude/skills/` que deben considerarse parte del sistema de trabajo aunque no aparezcan listadas automáticamente por la herramienta.

Skills actualmente disponibles en el repo:

* `obsidian-markdown`
* `json-canvas`
* `obsidian-bases`
* `obsidian-cli`
* `defuddle`

Regla de uso:

* Antes de editar notas `.md`, revisar `.claude/skills/obsidian-markdown/SKILL.md` si el trabajo afecta formato Obsidian.
* Antes de automatizar o consultar la bóveda por terminal, revisar `.claude/skills/obsidian-cli/SKILL.md`.
* Antes de trabajar con `.canvas`, revisar `.claude/skills/json-canvas/SKILL.md`.
* Antes de trabajar con `.base`, revisar `.claude/skills/obsidian-bases/SKILL.md`.
* Antes de importar o limpiar contenido web, revisar `.claude/skills/defuddle/SKILL.md`.

Si una skill local no está siendo considerada automáticamente, la solución es inspeccionar manualmente su `SKILL.md` dentro de `.claude/skills/` al inicio de la tarea relevante.

## Objetivo del sistema
La bóveda debe funcionar como un segundo cerebro práctico, no como un archivo muerto. Cada nota debería responder, explícita o implícitamente, a estas preguntas:

1. ¿Qué es esto?
2. ¿Por qué importa?
3. ¿Con qué se relaciona?
4. ¿Qué debería hacer con ello?

Si una nota no ayuda a comprender, decidir o actuar, debe simplificarse o conectarse mejor.

## Principios de trabajo
* **Captura rápida, aclarado después:** primero registrar, luego estructurar.
* **Atomicidad útil:** una nota debe cubrir una unidad clara de información.
* **Contexto mínimo obligatorio:** cada nota necesita suficiente contexto para entenderse por sí sola.
* **Conexión explícita:** enlaza siempre proyectos, personas, investigaciones, ideas y notas diarias cuando exista relación.
* **Orientación a acción:** si algo requiere seguimiento, debe dejar una siguiente acción visible.
* **Pensar para el yo futuro:** evita frases ambiguas como "mirar esto" o "hablamos de algo importante".

## Estructura de la bóveda
Se respetará esta organización de directorios:

| Carpeta | Propósito |
| :--- | :--- |
| **daily-notes/** | Registro diario, braindumps, tareas, decisiones rápidas y observaciones |
| **proyectos/** | Un archivo `.md` por cada proyecto activo o relevante |
| **research/** | Investigación en bruto o semidestilada: ideas, resúmenes, hallazgos, herramientas y exploración |
| **playbooks/** | Procedimientos reutilizables, checklists, recetas operativas y flujos paso a paso |
| **sistemas/** | Notas de arquitectura, principios, diseño del segundo cerebro y decisiones estructurales del sistema |
| **personas/** | Contactos clave, historial, contexto relacional y oportunidades |
| **ideas/** | Ideas aún no convertidas en proyecto o investigación formal |
| **inbox/** | Captura rápida e información pendiente de procesar |
| **templates/** | Plantillas reutilizables para estandarizar notas |
| **resources/** | Referencias estables, cheatsheets, documentación consolidada o material de apoyo canónico |

## Convenciones de Obsidian
* **Enlaces internos:** usar siempre `[[doble corchete]]` para enlazar notas de la bóveda.
* **No usar:** evitar enlaces markdown del tipo `[texto](archivo.md)` para notas internas.
* **Backlinks intencionales:** cuando una nota mencione una persona, proyecto o investigación relevante, enlázala.
* **Embeds:** usar `![[nota]]` solo cuando ayude realmente a reutilizar contenido.
* **Callouts:** usar `[!note]`, `[!tip]`, `[!important]`, `[!warning]` o `[!example]` para destacar bloques con intención.

## Reglas de calidad para cualquier nota
Toda nota nueva o editada debería cumplir, cuando aplique, estas reglas:

* Tener `title`, `tags` y `related` en el frontmatter.
* Incluir una breve explicación del contexto o propósito.
* Incluir al menos un enlace relevante en `related` o en el cuerpo si existe relación real.
* Diferenciar hechos, interpretación y próximos pasos.
* Evitar duplicar información si ya existe una nota canónica.
* Si la nota contiene instrucciones ejecutables o repetibles, considerar si pertenece mejor a `playbooks/`.
* Si la nota define reglas permanentes del sistema, considerar si pertenece mejor a `sistemas/`.

## Convenciones por tipo de nota

### 1. Daily Note (`daily-note.md`)
Debe ayudar a decidir y recordar, no solo a volcar texto.

* **Título:** fecha en formato `YYYY-MM-DD`.
* **Uso:** foco diario, captura rápida, decisiones, aprendizajes, seguimiento y cierre.
* **Secciones clave:** foco, agenda/seguimiento, notas, decisiones, completado, ideas y referencias.
* **Criterio:** cualquier idea, tarea o conversación importante debe enlazarse a su nota correspondiente o dejar pista clara para crearla.

### 2. Proyecto (`proyecto.md`)
Debe servir como centro operativo del proyecto.

* **Título:** nombre del proyecto en H1.
* **Metadata mínima:** estado, fecha de inicio, fecha objetivo, responsable o contexto si aplica.
* **Secciones clave:** descripción, resultado esperado, objetivos, estado actual, decisiones, próximos pasos, bloqueos y relacionado.
* **Criterio:** siempre debe quedar visible cuál es la siguiente acción y qué cambió recientemente.

### 3. Investigación (`research.md`)
Debe convertir información externa en conocimiento reutilizable.

* **Título:** tema, herramienta, pregunta o recurso investigado.
* **Metadata mínima:** fuente, fecha, relevancia, tipo y estado de procesamiento.
* **Secciones clave:** pregunta o motivo, resumen, insights, implicaciones, aplicación práctica y relacionado.
* **Criterio:** evitar copiar información sin destilar. La nota debe reflejar qué entendí y cómo podría usarlo.

### 4. Playbook (`playbook.md`)
Debe convertir conocimiento en ejecución repetible.

* **Título:** nombre del flujo, proceso o procedimiento.
* **Metadata mínima:** objetivo, ámbito, frecuencia, estado y herramientas implicadas.
* **Secciones clave:** objetivo, cuándo usarlo, precondiciones, pasos, validación, riesgos y relacionado.
* **Criterio:** cualquier proceso que espere repetir o delegar debe acabar aquí, no perdido dentro de una investigación.

### 5. Comparativa (`comparativa.md`)
Debe ayudar a decidir entre opciones reales.

* **Título:** decisión o problema a comparar.
* **Metadata mínima:** tema, estado de decisión y criterio principal.
* **Secciones clave:** problema, opciones, criterios, evaluación, recomendación, decisión y relacionado.
* **Criterio:** si una nota contrasta alternativas, conviene capturar la recomendación y la decisión final explícitamente.

### 6. Persona (`persona.md`)
Debe preservar contexto relacional y memoria conversacional útil.

* **Contenido mínimo:** quién es, relación, contexto, conversaciones relevantes, oportunidades pendientes y proyectos relacionados.
* **Criterio:** una nota de persona debe ayudarme a retomar una relación con contexto suficiente sin depender de mi memoria.

### 7. Sistema (`sistemas/`)
Las notas de `sistemas/` recogen arquitectura, principios y decisiones del propio segundo cerebro.

* **Contenido mínimo:** problema de diseño, principio, decisión, tradeoffs y efectos sobre la bóveda.
* **Criterio:** si una nota explica cómo debe funcionar el sistema, no debería vivir mezclada con notas de investigación.

## Criterios de enlazado
Usa estos patrones siempre que existan:

* Una **daily note** enlaza a proyectos activos, personas con las que hablé e investigaciones consultadas ese día.
* Una **investigación** enlaza al proyecto donde puede aplicarse.
* Un **playbook** enlaza a la investigación o sistema del que nace.
* Un **proyecto** enlaza a las investigaciones, personas y notas diarias relevantes.
* Una **persona** enlaza a proyectos compartidos, reuniones, decisiones y seguimientos.
* Una nota de **sistema** enlaza a plantillas, playbooks o proyectos que afecta.

## Regla de promoción de notas
Las notas deben evolucionar con este criterio:

* **`inbox/` -> `research/`:** cuando una captura ya tiene contexto mínimo y una pregunta clara.
* **`research/` -> `playbooks/`:** cuando el conocimiento ya puede ejecutarse de forma repetible.
* **`research/` o `playbooks/` -> `resources/`:** cuando el contenido ya es referencia estable y canónica.
* **`research/` -> `sistemas/`:** cuando el hallazgo se convierte en principio, arquitectura o regla del segundo cerebro.

Si existen varias notas sobre el mismo tema, una debe convertirse en nota canónica y las demás deben resumirse, enlazarse o archivarse.

## Ejemplos de clasificación
Usar estas heurísticas rápidas:

* **`research/`**: comparativas, exploración, hipótesis, notas aún no consolidadas.
* **`playbooks/`**: instalación, configuración, checklists, procedimientos repetibles.
* **`sistemas/`**: principios del segundo cerebro, memoria, arquitectura, decisiones estructurales.
* **`resources/`**: guías maestras, manuales consolidados y referencias de consulta frecuente.

## Mantenimiento y revisión
* **Sintaxis de plantillas:** usar `{{date:YYYY-MM-DD}}` y `{{title}}`, compatibles con el plugin **Templates** de Obsidian.
* **Notas huérfanas:** revisar periódicamente enlaces faltantes y notas sin conexión útil.
* **Notas incompletas:** priorizar el procesamiento de `inbox/` y cualquier nota sin contexto.
* **Higiene del sistema:** ejecutar `obsidian orphans` y `obsidian unresolved` periódicamente.
* **Criterio editorial:** si una nota crece demasiado, dividirla en subnotas conectadas.
