---
title: revisión semanal del ecosistema WSL y gobernanza de repos
type: spec
estado: activo
tags: [spec, wsl, governance, weekly-review, design-system, contracts]
related:
  - "[[Revisión Semanal Completa de la Bóveda y Repositorios]]"
  - "[[CONTRACT_HIERARCHY]]"
  - "[[Anclora Group]]"
  - "[[Mapa del Sistema de Agentes]]"
---

# revisión semanal del ecosistema WSL y gobernanza de repos

## Objetivo

Rediseñar la revisión semanal de la bóveda para que refleje la realidad operativa actual del ecosistema Anclora:

1. la bóveda sigue siendo el centro de gobierno, memoria y cumplimiento
2. los repositorios del ecosistema viven en WSL, no en `C:\Users\antonio.ballesterosa\Desktop\Proyectos`
3. `anclora-design-system` pasa a ocupar un papel estructural como fuente ejecutable de tokens, patrones, assets y componentes reutilizables

El resultado esperado es un flujo semanal que ya no se limite a crear una daily note vacía, sino que prepare un brief útil sobre el estado de los repositorios, sus señales de cambio y las posibles acciones de sincronización con la bóveda, los contratos y el design system.

## Contexto

El sistema actual de revisión semanal fue diseñado para una fase anterior del ecosistema:

- la tarea automática de los viernes a las 15:00 crea o actualiza la daily note
- inserta bloques vacíos para mantenimiento de bóveda y estado de repositorios
- registra una línea de log indicando que la preparación se ha completado
- no audita realmente los repositorios del ecosistema

Además, varios scripts de gobernanza contractual siguen apuntando a rutas antiguas en Windows:

- `scripts/propagate-contracts.ps1`
- `scripts/audit-contract-sync.ps1`
- otros scripts relacionados con contratos y recordatorios

Eso genera dos problemas distintos:

1. la revisión semanal parece funcionar, pero prepara muy poco contexto real
2. la capa de scripts de gobernanza ya no está alineada con la ubicación actual de los repositorios en WSL

## Decisión de arquitectura validada

La arquitectura validada para el ecosistema queda separada así:

### 1. La bóveda

La bóveda es la fuente de verdad para:

- gobernanza
- contratos
- cumplimiento
- decisiones estructurales
- excepciones documentadas
- relación entre proyectos, apps, personas y sistemas
- trazabilidad de cambios que afectan al ecosistema

### 2. anclora-design-system

`anclora-design-system` es la fuente de verdad ejecutable para:

- design tokens
- assets de marca
- foundations visuales
- patrones de UI
- componentes reutilizables
- ejemplos y documentación de implementación

### 3. Repositorios de aplicación

Las aplicaciones del ecosistema consumen:

- contratos y gobernanza desde la bóveda
- tokens, patrones y componentes desde `anclora-design-system`

Los cambios en apps reales pueden quedarse como cambios locales o escalarse a:

- sincronización documental con la bóveda
- actualización del design system
- actualización contractual

## Resultado esperado

Al finalizar esta fase:

- existirá una fuente única máquina-legible del inventario de repos del ecosistema
- existirá una nota humana de referencia para navegar el mapa de repos
- la revisión semanal del viernes producirá una daily note con contexto real sobre repositorios WSL
- la revisión semanal clasificará señales de cambio con una heurística híbrida útil
- la capa de scripts dejará de depender de rutas hardcodeadas antiguas en `Desktop\Proyectos`
- quedará explícita la relación operativa entre bóveda, contratos, design system y repos consumidores

## Diseño del sistema

### 1. Inventario central de repos

Se crea un archivo canónico en:

- `docs/governance/ecosystem-repos.json`

Este archivo será la fuente de verdad máquina-legible para scripts. Sustituirá la dispersión actual de rutas embebidas en varios `.ps1`.

Cada entrada debe incluir como mínimo:

- `id`
- `name`
- `path_wsl`
- `path_windows`
- `family`
- `tier`
- `obsidian_note`
- `design_system_role`
- `contracts_role`
- `status`

Cuando el repo lo necesite, también incluirá reglas de paths de alto impacto:

- `high_impact_paths.design_system`
- `high_impact_paths.contracts`
- `high_impact_paths.docs`

Este archivo no es una nota de conocimiento; es una pieza operativa del sistema.

### 2. Mapa humano de repos

Se crea una nota de referencia en:

- `resources/Mapa de repos del ecosistema Anclora.md`

Esta nota debe explicar:

- qué repos forman parte del ecosistema
- qué rol cumple cada repo
- qué nota principal del vault lo documenta
- si consume contratos
- si consume el design system
- si es fuente de verdad ejecutable o consumidor

La nota debe servir como mapa navegable para el yo futuro, no como sustituto del JSON.

### 3. Nuevo objetivo de la revisión semanal

La revisión semanal deja de tener como objetivo “crear una nota para rellenar después”.

Su nuevo objetivo es:

- preparar un brief semanal operativo ya pre-rellenado

La tarea automática de los viernes a las 15:00 se mantiene, pero el script principal debe:

1. asegurar que la daily note del día existe
2. leer `ecosystem-repos.json`
3. escanear los repositorios WSL definidos en el inventario
4. recopilar señales mínimas por repo
5. clasificar los hallazgos
6. escribir un resumen útil dentro de la daily note
7. registrar el resultado en el log

### 4. Señales mínimas a recopilar por repo

Cada revisión semanal debe recopilar, como mínimo:

- accesibilidad de la ruta WSL
- rama actual
- hash corto del último commit
- fecha del último commit
- autor del último commit
- mensaje del último commit
- existencia o no de cambios sin commitear
- existencia de `README.md`

Opcionalmente, cuando la estructura del repo lo permita:

- lista resumida de archivos cambiados desde una ventana temporal reciente
- señales de documentación relevante modificada

### 5. Clasificación híbrida de hallazgos

La revisión semanal no debe limitarse a listar repos. Debe clasificar señales de cambio usando un enfoque híbrido:

#### Capa 1. Naturaleza del repo

El inventario aporta contexto base:

- si el repo es una app consumidora
- si es repo de sistema
- si es `anclora-design-system`
- si es repo con peso contractual alto

#### Capa 2. Paths de alto impacto

La clasificación se afina según archivos o carpetas modificadas:

- cambios en `README.md` o `docs/` generan señal `DOC_SYNC`
- cambios en rutas de UI compartida, theme, tokens o patterns generan señal `DESIGN_SYSTEM_SYNC`
- cambios en rutas ligadas a shell, i18n, modal, motion o docs contractuales generan señal `CONTRACT_SYNC`
- cambios fuera de esos ámbitos se tratan como `APP_ONLY`
- si la señal es insuficiente o contradictoria, el sistema marca `INVESTIGATE`

#### Categorías finales

Las categorías válidas serán:

- `APP_ONLY`
- `DOC_SYNC`
- `DESIGN_SYSTEM_SYNC`
- `CONTRACT_SYNC`
- `INVESTIGATE`

El objetivo no es automatizar decisiones finales, sino reducir carga mental y hacer visibles las candidatas obvias.

### 6. Tratamiento especial de anclora-design-system

`anclora-design-system` debe tratarse como repo de alto impacto sistémico.

Cuando presente cambios, la revisión semanal debe destacarlo explícitamente y distinguir, cuando sea posible:

- cambios en tokens o foundations
- cambios en componentes reutilizables
- cambios en documentación o showcase
- cambios con posible impacto contractual

Este repo no se considera una app más del ecosistema. Se considera infraestructura de diseño compartida.

### 7. Daily note del viernes

El bloque `## 🐙 Estado Semanal de Repositorios` ya no debe quedar como placeholder vacío. Debe mostrar, al menos:

- repositorios verificados
- repositorios inaccesibles
- repos con actividad reciente
- repos sin actividad reciente
- alertas de sincronización documental
- alertas candidatas a contratos
- alertas candidatas a design system

El bloque `## 🤖 Resultado de tarea automática` debe reflejar trabajo real, por ejemplo:

- inventario cargado correctamente
- número de repos auditados
- número de alertas generadas
- repos que requieren revisión manual
- siguiente acción sugerida

### 8. Capa de scripts

La responsabilidad de scripts debe quedar separada:

- `scripts/start-weekly-review.ps1`
  - orquestador principal
  - asegura daily note
  - ejecuta escaneo
  - inyecta resumen en la nota

- `scripts/scan-ecosystem-repos.ps1`
  - lee `ecosystem-repos.json`
  - inspecciona los repos WSL
  - devuelve datos estructurados y clasificación

- `scripts/build-weekly-review-summary.ps1`
  - transforma los datos del escaneo en markdown para la daily note

Después de estabilizar esa capa, se adaptarán scripts contractuales ya existentes para que usen el inventario central, empezando por:

- `scripts/audit-contract-sync.ps1`
- `scripts/propagate-contracts.ps1`

## Flujo operativo esperado

El nuevo flujo semanal quedará así:

1. el viernes a las 15:00 se dispara la tarea automática
2. se valida o crea la daily note del día
3. se lee el inventario `ecosystem-repos.json`
4. se escanean los repos WSL del ecosistema
5. se clasifican los cambios detectados
6. se genera un resumen en la daily note
7. el usuario revisa ese brief y decide:
   - actualizar una nota de proyecto o recurso
   - abrir una revisión contractual
   - revisar `anclora-design-system`
   - dejar el cambio como `APP_ONLY`

## Documentos a crear o actualizar

### Crear

- `docs/governance/ecosystem-repos.json`
- `resources/Mapa de repos del ecosistema Anclora.md`
- `scripts/scan-ecosystem-repos.ps1`
- `scripts/build-weekly-review-summary.ps1`

### Actualizar

- `scripts/start-weekly-review.ps1`
- `playbooks/Revisión Semanal Completa de la Bóveda y Repositorios.md`
- `scripts/README.md`

### Migración posterior

- `scripts/audit-contract-sync.ps1`
- `scripts/propagate-contracts.ps1`
- otros scripts de gobernanza que todavía dependan de rutas antiguas

## Verificación requerida

La fase se considerará correcta solo si se verifican estas condiciones:

### 1. Inventario y mapa

- existe `ecosystem-repos.json` y es legible por PowerShell
- existe la nota humana del mapa de repos
- ambos artefactos no se contradicen en los repos principales

### 2. Revisión semanal

- la tarea semanal sigue pudiendo ejecutarse en viernes a las 15:00
- la daily note del día se crea o actualiza sin corrupción de texto
- el bloque de repositorios contiene datos reales y no solo placeholders
- el bloque de resultado automático refleja el escaneo realizado

### 3. Alineación con WSL

- el sistema puede leer rutas WSL del inventario
- los repos ya no dependen de rutas antiguas de `Desktop\Proyectos`
- los fallos de acceso quedan reflejados como alertas visibles y no como silencio

### 4. Clasificación

- al menos un conjunto de cambios de ejemplo puede clasificarse como `APP_ONLY`
- al menos un conjunto de cambios de ejemplo puede clasificarse como `DOC_SYNC`
- la lógica permite detectar candidatos de `DESIGN_SYSTEM_SYNC` y `CONTRACT_SYNC`

## Riesgos

- intentar automatizar demasiado pronto la interpretación fina de cambios
- acoplar la weekly review a convenciones de paths que todavía no estén estabilizadas en todos los repos
- duplicar contenido entre el JSON y la nota humana
- mezclar en una sola fase la mejora de la bóveda con la reestructuración del repo `anclora-design-system`

## Fuera de alcance

Esta fase no incluye todavía:

- la reestructuración de `anclora-design-system` como monorepo
- la implementación del paquete React oficial del design system
- la migración completa de todos los scripts contractuales existentes
- la actualización manual de todas las notas históricas que todavía referencian rutas antiguas

La fase se centra solo en:

- inventario central de repos
- revisión semanal útil sobre WSL
- clasificación básica de cambios
- consolidación del reparto de autoridad entre bóveda, contratos y design system
