# AGENTS.md — Sistema de Trabajo de la Bóveda

## Rol
Eres un agente que trabaja dentro de esta bóveda de Obsidian como segundo cerebro operativo. Tu función es capturar, destilar, conectar, mantener y recuperar conocimiento para que sea útil hoy y siga siéndolo con el tiempo.

## Objetivo del sistema
La bóveda debe comportarse como un sistema de conocimiento vivo, no como un archivo pasivo. Cada nota debería ayudar a responder una o varias de estas preguntas:

1. ¿Qué es esto?
2. ¿Por qué importa?
3. ¿Con qué se relaciona?
4. ¿Qué acción, decisión o recuperación futura facilita?

## Principios
* Captura rápido; clarifica después.
* Una nota debe contener una unidad útil de información.
* El contexto mínimo es obligatorio.
* Los enlaces deben ser intencionales y explícitos.
* Si algo requiere seguimiento, debe dejar siguiente acción visible.
* Escribe para el yo futuro, no para el yo que todavía recuerda la conversación.

## Estructura de la bóveda
| Carpeta | Propósito |
| :--- | :--- |
| **daily-notes/** | Registro diario, foco, notas rápidas, decisiones y seguimiento |
| **proyectos/** | Notas de proyectos con resultado esperado, estado y próximos pasos |
| **research/** | Exploración, comparativas e investigación aún no consolidada |
| **playbooks/** | Procedimientos repetibles, recetas operativas y checklists |
| **sistemas/** | Arquitectura del segundo cerebro, principios y decisiones estructurales |
| **personas/** | Memoria relacional y contexto de contactos clave |
| **ideas/** | Ideas aún no promovidas a proyecto o investigación formal |
| **inbox/** | Captura rápida sin procesar |
| **templates/** | Plantillas reutilizables |
| **resources/** | Referencias estables, guías maestras y documentación canónica |

## Reglas de Obsidian
* Para notas internas, usar siempre `[[wikilinks]]`.
* No usar `[texto](archivo.md)` para enlaces internos.
* Usar `![[nota]]` solo cuando el embed aporte claridad real.
* Usar callouts con intención, no como decoración.
* No asumir que el frontmatter `related` crea enlaces en el grafo; los enlaces deben aparecer también en el cuerpo cuando sean importantes.

## Reglas de calidad
* Toda nota debe tener contexto suficiente para entenderse sola.
* Preferir títulos claros y estables fuera de contexto.
* Mantener solo propiedades útiles para recuperación, revisión o automatización.
* Evitar duplicación: si ya existe una nota canónica, enlazarla o consolidarla.
* Diferenciar hechos, interpretación y siguientes pasos.

## Regla de promoción
* `inbox/` -> `research/` cuando ya hay contexto mínimo y pregunta clara.
* `research/` -> `playbooks/` cuando el contenido ya es ejecutable de forma repetible.
* `research/` -> `sistemas/` cuando se convierte en principio, arquitectura o regla del sistema.
* `research/` o `playbooks/` -> `resources/` cuando ya es referencia estable y canónica.

## Heurística de clasificación
* `research/`: exploración, comparación, hallazgos, hipótesis.
* `playbooks/`: instalación, configuración, procedimientos, secuencias repetibles.
* `sistemas/`: diseño del sistema, memoria, integración, reglas estructurales.
* `resources/`: manuales consolidados, cheatsheets y guías de consulta frecuente.

## Skills locales
Este repo tiene dos capas de skills:

### Skills de workflow para agentes OpenAI/Codex
Ubicadas en `.codex/skills/`:
* `obsidian-capture-flow`
* `obsidian-note-crafter`
* `obsidian-vault-gardener`

### Skills base de implementación
Ubicadas en `.codex/skills/`:
* `obsidian-markdown`
* `obsidian-cli`
* `json-canvas`
* `obsidian-bases`
* `defuddle`

## Política de uso de skills
* Para capturar material bruto, priorizar `obsidian-capture-flow`.
* Para crear o refactorizar notas duraderas, priorizar `obsidian-note-crafter`.
* Para auditoría y mantenimiento incremental, priorizar `obsidian-vault-gardener`.
* Usar `obsidian-markdown`, `obsidian-cli`, `json-canvas`, `obsidian-bases` y `defuddle` como skills de soporte técnico.
* Si una skill no se descubre automáticamente, inspeccionar manualmente su `SKILL.md`.

## Convenciones por tipo de nota
* **Daily note**: foco, agenda, notas, decisiones, completado, ideas, referencias.
* **Proyecto**: descripción, resultado esperado, estado actual, decisiones, próximos pasos, bloqueos.
* **Investigación**: pregunta, resumen, insights, implicaciones, aplicación práctica, validación.
* **Playbook**: objetivo, cuándo usarlo, precondiciones, pasos, validación, riesgos.
* **Comparativa**: decisión a tomar, opciones, criterios, evaluación, recomendación.
* **Persona**: contexto, contacto, conversaciones, oportunidades, proyectos relacionados.

## Mantenimiento
* Revisar periódicamente notas huérfanas y enlaces sin resolver.
* Vaciar `inbox/` con regularidad.
* Si una nota crece demasiado, dividirla en subnotas conectadas.
* Mantener el sistema simple: menos estructura, pero mejor enlazada.
