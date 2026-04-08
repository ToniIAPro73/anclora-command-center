---
title: Anclora Talent
aliases: [Anclora Talent, Anclora Press]
estado: activo
fecha_inicio: 2026-03-31
fecha_objetivo:
resultado_esperado: Consolidar una plataforma editorial operativa para crear, editar, previsualizar y presentar proyectos canónicos dentro del ecosistema Anclora.
area: editorial-platform
repo: https://github.com/ToniIAPro73/anclora-talent.git
url: https://anclora-talent.vercel.app/
scope: editorial-platform
arquitecto_jefe: "[[personas/Toni|Toni]]"
tags: [proyecto, anclora, editorial, premium]
related:
  - "[[Anclora Group]]"
  - "[[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS|Anclora Ecosystem Contract Groups]]"
  - "[[ANCLORA_PREMIUM_APP_CONTRACT|Anclora Premium App Contract]]"
  - "[[Anclora Content Generator AI]]"
  - "[[personas/Toni|Toni]]"
---

# Anclora Talent

## 📋 Descripción

Aplicación editorial del ecosistema Anclora orientada a gestionar proyectos, documentos canónicos, preview de contenido y estudio de portada desde una base moderna en `Next.js App Router`.

Es la evolución vigente de la etapa previa de [[Anclora Press]] dentro de la memoria del sistema. A efectos canónicos de la bóveda, la app que debe usarse y enlazarse es [[Anclora Talent]].

## 🏁 Resultado esperado

Disponer de una plataforma editorial operativa que permita crear y administrar proyectos con autenticación, persistencia, edición, preview y gestión básica de assets.

## 🎯 Objetivos

- Objetivo principal: consolidar una superficie editorial interna y protegida para proyectos y documentos canónicos.
- Objetivo secundario: estructurar un flujo completo de `login -> dashboard -> crear proyecto -> editor -> preview -> cover`.
- Objetivo secundario: dejar preparada la capa de persistencia y assets para evolucionar hacia importación y exportación reales.

## 📍 Estado actual

- Situación actual: proyecto activo con despliegue en `https://anclora-talent.vercel.app/` y repositorio operativo en GitHub.
- Último avance relevante: el README confirma base en `Next.js App Router`, autenticación con `Clerk`, persistencia preparada para `Neon`, assets en `Vercel Blob` y fallback a store en memoria para desarrollo local.
- Principal riesgo o bloqueo: todavía falta conectar importación real `txt/docx` y exportación PDF sobre el flujo ya implementado.

## 🧾 Marco contractual

- Familia contractual: `Premium`.
- Idioma objetivo: `es/en`, con `es` por defecto.
- Tema objetivo: `dark/light`, con `dark` por defecto.
- Contratos aplicables: [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]], [[ANCLORA_PREMIUM_APP_CONTRACT]], [[UI_MOTION_CONTRACT]], [[MODAL_CONTRACT]], [[LOCALIZATION_CONTRACT]].
- Criterio de lectura: la app debe sentirse como una plataforma editorial premium y no como un dashboard interno genérico.
- Encaje de ecosistema: app premium fuera del vertical Real Estate, igual que [[Anclora Impulso]].

## 📌 Decisiones clave

| Fecha | Decisión | Contexto |
|-------|----------|----------|
| 2026-03-31 | Se incorpora Anclora Talent a la bóveda como proyecto activo del ecosistema. | Ya dispone de repo propio y despliegue en Vercel. |
| 2026-03-31 | Se documenta como plataforma editorial, no como simple experimento UI. | El README define un flujo MVP funcional con autenticación, dashboard, editor, preview y cover. |
| 2026-04-08 | Se consolida `Anclora Talent` como nombre canónico en la bóveda. | Sustituye la etapa previa de `Anclora Press` dentro del ecosistema ya formalizado de [[Anclora Group]]. |

## 🧱 Arquitectura técnica real

- Aplicación construida sobre `Next.js App Router`.
- Autenticación gestionada con `Clerk`.
- Persistencia preparada para `Neon`.
- Assets preparados para `Vercel Blob`.
- Estructura interna separada por rutas `src/app`, componentes `src/components`, auth `src/lib/auth`, base de datos `src/lib/db`, proyectos `src/lib/projects` y utilidades de Blob `src/lib/blob`.

## ⏭️ Próximos pasos

- [ ] Documentar mejor el encaje de `Anclora Talent` dentro del mapa de aplicaciones del grupo.
- [ ] Conectar importación real `txt/docx` sobre el flujo editorial existente.
- [ ] Añadir exportación PDF sobre el mismo modelo documental.

## 🚧 Bloqueos

- Faltan importación y exportación reales para completar el flujo editorial.

## 🧠 Aprendizajes

- El proyecto ya tiene base técnica y producto mínimos suficientemente claros como para tratarlo como nodo activo del ecosistema.
- Su valor no está solo en edición de contenido, sino en ordenar proyectos editoriales canónicos con autenticación y persistencia moderna.

## 🛠️ Sistemas y playbooks relacionados

- Sistema o principio: [[Anclora Group]]
- Nodo editorial relacionado: [[Anclora Content Generator AI]]
- Contrato de referencia: [[ANCLORA_PREMIUM_APP_CONTRACT]]
- App premium hermana fuera de Real Estate: [[Anclora Impulso]]

## 🔗 Relacionado

- [[Anclora Group]]
- [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS|Anclora Ecosystem Contract Groups]]
- [[ANCLORA_PREMIUM_APP_CONTRACT|Anclora Premium App Contract]]
- [[Anclora Content Generator AI]]
- [[personas/Toni|Toni]]

#proyecto #anclora
