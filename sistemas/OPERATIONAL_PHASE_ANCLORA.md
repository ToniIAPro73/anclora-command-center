# **FASE OPERATIVA: EXPRIMIENDO EL SEGUNDO CEREBRO**

## **1\. CONTROL DE CALIDAD TÉCNICO (Propiedades)**

Para que el sistema sea profesional, las propiedades en templates/ deben estar "limpias" (vacías o con valores por defecto) pero el agente debe conocer las opciones.

**Acción:** Ajusta tus plantillas siguiendo estos **Estándares de Datos para Codex**:

### **Estándares de Valores (Enums)**

| Propiedad | Valores Válidos para Codex |
| :---- | :---- |
| status (Persona) | prospecto, activo, inactivo, vetado |
| influence\_level | bajo, medio, alto, clave |
| status (Proyecto) | idea, en\_progreso, pausado, completado |
| type | persona, proyecto, research, playbook |

*Nota: Al crear una nota, Codex elegirá **uno** de estos valores. No debe escribir la lista completa.*

## **2\. EL RETO DEL "MUNDO REAL"**

Deja de usar datos "semilla". Es hora de que el cerebro trabaje para ti.

**Acción:** Crea una ficha para un partner real.

"Codex, crea una ficha para \[Nombre Real\] usando la plantilla de Partner Synergi. Define su influence\_level basándote en que es \[Descripción de su importancia\]. Agrégalo a la carpeta personas/."

## **3\. SIMULACIÓN DE NEGOCIO (Uso del Playbook)**

Usa el nuevo flujo-comercial-inteligente.md para preparar una reunión.

**Acción (Prompt para Codex):**

"Codex, basándote en la nota de \[\[Arquitectura de Integración Anclora\]\] y el perfil de \[\[Lucia Serrano\]\], prepárame un **guion de reunión de 15 minutos**. El objetivo es explicarle cómo Anclora Nexus va a proteger su pipeline de ventas usando la IA de Content Generator."

## **4\. INSTALAR EL HÁBITO DEL "BRAINDUMP"**

**Acción:** Mañana, al terminar el día, lanza este comando:

codex run obsidian-capture-flow \--input "Resumen de hoy: \[Lo que hiciste\]" \--target "Daily Note"

## **5\. VISUALIZACIÓN DEL GRAFO**

Busca el nodo de Anclora Group. Si ves notas "sueltas", usa:

codex run obsidian-vault-gardener \--task "Enlazar todas las notas huérfanas que mencionen Anclora con la nota maestra"

## **6\. PRÓXIMO GRAN PROYECTO: EL "DASHBOARD"**

Crea una nota llamada Anclora Command Center.md para centralizar la vista de:

1. Próximos pasos de proyectos.  
2. Partners con influence\_level: clave.  
3. Últimos commits de GitHub.

\#sistema \#estrategia \#anclora