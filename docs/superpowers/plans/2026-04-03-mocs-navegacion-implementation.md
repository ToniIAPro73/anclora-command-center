# MOCs de Navegación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear tres MOCs estables en `resources/` para mejorar la navegación temática de la bóveda sin duplicar hubs existentes.

**Architecture:** Se añadirán tres notas MOC ligeras en `resources/`, cada una con una intención de navegación distinta: real estate comercial, stack operativo y marca personal. Después se integrarán de forma mínima en hubs ya existentes para que entren en circulación dentro del grafo y de la navegación diaria.

**Tech Stack:** Obsidian markdown, wikilinks, frontmatter YAML, estructura de la bóveda existente

---

### Task 1: Crear `MOC Real Estate Comercial`

**Files:**
- Create: `resources/moc-real-estate-comercial.md`
- Reference: `resources/moc-de-negocio.md`
- Reference: `Anclora Command Center.md`

- [ ] **Step 1: Redactar la nota base con frontmatter y resumen**

```md
---
title: MOC Real Estate Comercial
aliases: [MOC Real Estate Comercial]
type: business-moc
estado: activo
tags: [resource, moc, real-estate, comercial]
related:
  - "[[MOC de Negocio]]"
  - "[[Anclora Group]]"
  - "[[Anclora Command Center]]"
---

# MOC Real Estate Comercial

Mapa de navegación para la capa inmobiliaria y comercial del ecosistema Anclora. Sirve para entrar rápido en captación, autoridad, funnel, CRM, seguimiento y reporting.
```

- [ ] **Step 2: Añadir secciones de navegación con enlaces canónicos**

```md
## Qué cubre este mapa

- navegación comercial del vertical inmobiliario
- relación entre captación, autoridad y seguimiento
- acceso rápido a dashboards, playbooks y research útil

## Núcleo comercial

- [[Anclora Private Estates]]
- [[Anclora Private Estates Landing Page]]
- [[Anclora Command Center]]
- [[Anclora Cuadro de Mando Real Estate]]

## Captación y autoridad

- [[Prospección Avanzada con Nexus]]
- [[Estrategia de Autoridad IA Inmobiliaria]]
- [[Funnel de Captación Inmobiliaria con IA]]
- [[Captación Inmobiliaria con IA - insights NotebookLM]]

## Operación y seguimiento

- [[CRM Inmobiliario con IA]]
- [[Nutrición y Seguimiento Comercial con IA]]
- [[Reportes Automáticos para Inmobiliarias]]
- [[Operativa Inmobiliaria con IA - insights NotebookLM]]

## Relacionado

- [[MOC de Negocio]]
- [[Anclora Group]]
- [[Mapa de Stakeholders de Anclora Group]]
```

- [ ] **Step 3: Guardar y revisar legibilidad**

Run: abrir `resources/moc-real-estate-comercial.md` y comprobar que no haya enlaces vacíos, texto redundante ni secciones demasiado largas.
Expected: nota breve, navegable en menos de 30 segundos.

- [ ] **Step 4: Commit**

```bash
git add resources/moc-real-estate-comercial.md
git commit -m "docs: add real estate commercial moc"
```

### Task 2: Crear `MOC Stack Operativo Anclora`

**Files:**
- Create: `resources/moc-stack-operativo-anclora.md`
- Reference: `resources/anclora-group.md`
- Reference: `playbooks/flujo-comercial-inteligente.md`

- [ ] **Step 1: Redactar la nota base**

```md
---
title: MOC Stack Operativo Anclora
aliases: [MOC Stack Operativo Anclora]
type: business-moc
estado: activo
tags: [resource, moc, stack, operaciones]
related:
  - "[[MOC de Negocio]]"
  - "[[Anclora Group]]"
  - "[[Flujo Comercial Inteligente Anclora]]"
---

# MOC Stack Operativo Anclora

Mapa de navegación del stack que convierte señal, contenido y coordinación en operación real dentro del ecosistema Anclora.
```

- [ ] **Step 2: Añadir bloques de aplicaciones, fuentes y sistemas**

```md
## Qué cubre este mapa

- aplicaciones núcleo del ecosistema
- fuentes de señal y contexto
- superficies de coordinación y seguimiento
- notas de sistema que explican el flujo completo

## Núcleo de aplicaciones

- [[Anclora Nexus]]
- [[Anclora Synergi]]
- [[Anclora Data Lab]]
- [[Anclora Content Generator AI]]

## Fuentes y señales

- [[Inmovilla]]
- [[StateFox]]

## Coordinación y superficies

- [[Coda]]
- [[Slack]]
- [[Anclora Command Center]]

## Sistemas y flujos que lo explican

- [[Flujo Comercial Inteligente Anclora]]
- [[Arquitectura de Integración Anclora]]
- [[Arquitectura Implementable de Automatización Anclora]]

## Relacionado

- [[MOC de Negocio]]
- [[Anclora Group]]
- [[Anclora Cuadro de Mando Real Estate]]
```

- [ ] **Step 3: Guardar y revisar solapamiento con `MOC de Negocio`**

Run: leer `resources/moc-stack-operativo-anclora.md` junto con `resources/moc-de-negocio.md`
Expected: el nuevo MOC navega el stack; `MOC de Negocio` sigue siendo el hub más general.

- [ ] **Step 4: Commit**

```bash
git add resources/moc-stack-operativo-anclora.md
git commit -m "docs: add operational stack moc"
```

### Task 3: Crear `MOC Toni - Marca Personal y Autoridad`

**Files:**
- Create: `resources/moc-toni-marca-personal-y-autoridad.md`
- Reference: `personas/Toni.md`
- Reference: `resources/Propuesta de Valor de Toni - Real Estate + IA.md`

- [ ] **Step 1: Redactar la nota base**

```md
---
title: MOC Toni - Marca Personal y Autoridad
aliases: [MOC Toni Marca Personal, MOC Toni Autoridad]
type: business-moc
estado: activo
tags: [resource, moc, marca-personal, autoridad]
related:
  - "[[personas/Toni|Toni]]"
  - "[[Propuesta de Valor de Toni - Real Estate + IA]]"
  - "[[Pruebas de Autoridad y Casos Reales]]"
---

# MOC Toni - Marca Personal y Autoridad

Mapa de navegación para la identidad profesional de Toni, su propuesta de valor, sus activos de credibilidad y el contexto comercial que sostiene su posicionamiento.
```

- [ ] **Step 2: Añadir bloques de identidad, mensajes y pruebas**

```md
## Qué cubre este mapa

- identidad profesional y posicionamiento
- mensajes y narrativa comercial
- activos de credibilidad y autoridad
- contexto relacional y estratégico

## Identidad y posicionamiento

- [[personas/Toni|Toni]]
- [[Bio y Pitch de Toni - Real Estate + IA]]
- [[Propuesta de Valor de Toni - Real Estate + IA]]

## Pruebas de autoridad

- [[Pruebas de Autoridad y Casos Reales]]
- [[Portfolio técnico y casos demostrables de Toni]]
- [[Playa Viva - Landing real con HubSpot y dossier personalizado]]
- [[Azure Bay - Caso de estudio de landing premium]]

## Contexto comercial

- [[ICP Comprador Premium SW Mallorca]]
- [[Estrategia de Autoridad IA Inmobiliaria]]
- [[Plan Maestro de Marca Personal e Ingesta Comercial]]

## Personas y contexto relacional

- [[Mapa de Stakeholders de Anclora Group]]
- [[Jorge Cifre]]

## Relacionado

- [[Anclora Group]]
- [[Anclora Command Center]]
- [[MOC de Negocio]]
```

- [ ] **Step 3: Guardar y revisar enfoque**

Run: abrir `resources/moc-toni-marca-personal-y-autoridad.md`
Expected: la nota funciona como hub de posicionamiento y no se convierte en CV ni en duplicado de `personas/Toni`.

- [ ] **Step 4: Commit**

```bash
git add resources/moc-toni-marca-personal-y-autoridad.md
git commit -m "docs: add personal brand authority moc"
```

### Task 4: Integrar los nuevos MOCs en hubs existentes

**Files:**
- Modify: `resources/moc-de-negocio.md`
- Modify: `README.md`

- [ ] **Step 1: Añadir los tres MOCs al `MOC de Negocio`**

```md
## Mapas temáticos

- [[MOC Real Estate Comercial]]
- [[MOC Stack Operativo Anclora]]
- [[MOC Toni - Marca Personal y Autoridad]]
```

- [ ] **Step 2: Añadir navegación breve en el `README.md` raíz**

```md
- Mapa comercial: [[MOC Real Estate Comercial]]
- Mapa de stack: [[MOC Stack Operativo Anclora]]
- Mapa de marca personal: [[MOC Toni - Marca Personal y Autoridad]]
```

- [ ] **Step 3: Revisar integración**

Run: leer `resources/moc-de-negocio.md` y `README.md`
Expected: los nuevos MOCs aparecen como mapas secundarios útiles, sin desplazar a los hubs principales existentes.

- [ ] **Step 4: Commit**

```bash
git add resources/moc-de-negocio.md README.md
git commit -m "docs: integrate navigation mocs into existing hubs"
```

### Task 5: Verificación final

**Files:**
- Verify: `resources/moc-real-estate-comercial.md`
- Verify: `resources/moc-stack-operativo-anclora.md`
- Verify: `resources/moc-toni-marca-personal-y-autoridad.md`
- Verify: `resources/moc-de-negocio.md`
- Verify: `README.md`

- [ ] **Step 1: Verificar que los archivos existen y enlazan correctamente**

Run: `rg -n "^# MOC|\\[\\[" resources/moc-real-estate-comercial.md resources/moc-stack-operativo-anclora.md resources/moc-toni-marca-personal-y-autoridad.md resources/moc-de-negocio.md README.md`
Expected: los cinco archivos existen y contienen wikilinks hacia notas ya canónicas.

- [ ] **Step 2: Verificar que no se introdujeron placeholders**

Run: `rg -n "TBD|TODO|\\[\\[Nombre del Proyecto\\]\\]|\\[\\[wikilink\\]\\]" resources/moc-real-estate-comercial.md resources/moc-stack-operativo-anclora.md resources/moc-toni-marca-personal-y-autoridad.md`
Expected: sin resultados.

- [ ] **Step 3: Revisar cobertura de la spec**

Run: comparar `docs/superpowers/specs/2026-04-03-mocs-navegacion-design.md` con los tres archivos creados
Expected: los tres MOCs existen, viven en `resources/` y cubren las secciones y notas previstas en la spec.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-04-03-mocs-navegacion-implementation.md
git commit -m "docs: add implementation plan for navigation mocs"
```
