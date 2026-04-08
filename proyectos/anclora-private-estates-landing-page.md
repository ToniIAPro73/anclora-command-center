---
title: Anclora Private Estates Landing Page
aliases: [Anclora Private Estates Landing, Anclora Private Estates Landing Page]
estado: publicado
fecha_inicio: 2026-04-03
fecha_publicacion: 2026-04-05
fecha_objetivo:
resultado_esperado: Landing pública ultra premium de Anclora Private Estates activa en producción, dark-only, con cobertura ES/EN/DE y sistema de contenido tipado.
area: luxury-real-estate
repo: https://github.com/ToniIAPro73/anclora-private-estates-landing
url_produccion: https://anclora-private-estates-landing.vercel.app/
scope: public-flagship-landing
arquitecto_jefe: "[[personas/Toni|Toni]]"
tags: [proyecto, anclora, real-estate, landing, ultra-premium, dark-only, i18n]
related:
  - "[[Anclora Private Estates]]"
  - "[[Sistema canónico de landing premium Anclora]]"
  - "[[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS|Anclora Ecosystem Contract Groups]]"
  - "[[ANCLORA_ULTRA_PREMIUM_APP_CONTRACT|Anclora Ultra Premium App Contract]]"
  - "[[personas/Toni|Toni]]"
---

# Anclora Private Estates Landing Page

## Descripción

Repositorio operativo dedicado a la landing pública de [[Anclora Private Estates]]. Su función no es comportarse como catálogo masivo ni como dashboard reetiquetado, sino como superficie `flagship` de autoridad, posicionamiento territorial, captación cualificada y acceso selectivo al ecosistema del vertical.

Repo: `ToniIAPro73/anclora-private-estates-landing`
URL de producción: `https://anclora-private-estates-landing.vercel.app/`

## Resultado esperado

Disponer de una landing ultra premium alineada con el sistema canónico de Anclora y capaz de sostener:

- autoridad editorial en Palma y el suroeste de Mallorca
- captación de propietarios, compradores e inversores premium
- derivación selectiva hacia `Data Lab` y `Synergi`
- experiencia multilenguaje `es/en/de` desde el primer día

## Objetivos

- Objetivo principal: construir la puerta pública premium del vertical inmobiliario sin depender de un stock amplio de inmuebles.
- Objetivo secundario: traducir el canon dark de Anclora a una experiencia ultra premium específica para real estate.
- Objetivo secundario: dejar una base técnica y documental clara para evolucionar la landing hacia producto real sin rehacer su estructura.

## Estado actual

- Situación: **publicada en producción** en Vercel.
- Versión activa: versión "emergent" — dark-only, ES/EN/DE, acentos oro en inversores, Mallorca Focus y CTA final.
- Stack técnico activo: `Vite + React + TypeScript + Tailwind`, sin dependencias de framework de i18n externo.
- Contenido: centralizado en `src/content/site-copy.ts` como fuente tipada única para los tres idiomas.
- Tema: dark-only. El toggle de tema fue eliminado definitivamente. No existe modo light en esta landing.
- Idiomas: selector premium `ES / EN / DE` en navbar, persistido en `localStorage`.
- Tests: cobertura de Vitest para shell dark-only, switcher de idioma y regresiones de copia.

## Marco contractual

- Familia contractual: `Ultra Premium`.
- Idiomas activos: `es/en/de`. El idioma `fr` queda aplazado para una fase posterior.
- Tema activo: `dark-only`. Excepción documentada respecto al contrato de familia que permite multi-theme.
- Contratos aplicables: [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]], [[ANCLORA_ULTRA_PREMIUM_APP_CONTRACT]], [[LOCALIZATION_CONTRACT]], [[UI_MOTION_CONTRACT]].
- Excepciones locales documentadas:
  - `dark-only`: la landing opera exclusivamente en modo oscuro, sin toggle de tema. El contrato de familia admite multi-theme, pero esta landing lo simplifica como decisión editorial deliberada y documentada.
  - `es/en/de sin fr`: el idioma `fr` está fuera de alcance de esta versión. La cobertura se amplía al cuarto idioma en una iteración futura cuando el copy esté listo.

## Base técnica

- `Vite + React + TypeScript`
- CSS propio con sistema de tokens en `private-estates-tokens.css` y helpers en `private-estates-helpers.css`
- `site-copy.ts`: fuente tipada única de todo el contenido visible, con tipos exportados por sección
- `LanguageSwitcher.tsx`: control segmentado premium en navbar que reemplaza al toggle de tema
- Secciones: Hero, Credibilidad, Mallorca Focus, Inversor, Seller Intake, Data Lab Signals, Ecosystem Access, FAQ, Final CTA
- Footer institucional con marca, contacto, zonas foco, legal y mención eXp

## Decisiones clave

| Fecha | Decisión | Contexto |
|-------|----------|----------|
| 2026-04-03 | La landing se documenta como superficie operativa real y no como showcase ficticio. | Debe actuar como puerta pública del vertical y no como caso de portfolio. |
| 2026-04-03 | Se adopta el canon dark de Anclora como restricción principal de diseño. | La experiencia debe sentirse ultra premium y coherente con la familia Anclora. |
| 2026-04-05 | Se elige la versión "emergent" dark-only como versión definitiva de la v1. | Se descarta el modo light para simplificar la experiencia y reforzar la firma editorial. |
| 2026-04-05 | El toggle de tema se elimina y se reemplaza por un switcher de idioma premium. | Un selector `ES / EN / DE` es más valioso que un toggle de tema en una landing editorial. |
| 2026-04-05 | `site-copy.ts` centraliza todo el contenido visible como fuente tipada única. | Evita strings hardcodeados en JSX y garantiza consistencia de idioma en toda la superficie. |
| 2026-04-05 | Acentos oro en títulos de inversores, áreas de Mallorca Focus y CTA final. | Diferencia los nodos de valor comercial del resto de la composición sin saturar la paleta. |
| 2026-04-05 | `fr` queda aplazado a una fase posterior. | El copy en francés no está validado; incluirlo a medias degradaría la percepción ultra premium. |

## Próximos pasos

- [ ] Revisar y afinar el copy en los tres idiomas con revisión nativa o editorial.
- [ ] Conectar el formulario de propietarios (`SellerIntakeForm`) a backend, email o automatización.
- [ ] Ampliar cobertura de idioma a `fr` cuando el copy esté listo.
- [ ] Auditoría visual completa en desktop y mobile para cierre contractual ultra premium.
- [ ] Evaluar integración de assets visuales reales en el hero (foto editorial Mallorca).

## Bloqueos

- Ninguno activo. La landing está en producción.

## Aprendizajes

- El valor de esta landing no está en aparentar inventario abundante, sino en articular criterio territorial, red, inteligencia y ejecución premium.
- El canon visual de Anclora ya está suficientemente definido; el reto principal no es "inventar diseño", sino adaptarlo con disciplina al dominio `Private Estates`.
- Un switcher de idioma en lugar de un toggle de tema es la elección correcta para una landing de captación premium: más útil para el visitante, más coherente editorialmente.
- La centralización de contenido en un módulo tipado (`site-copy.ts`) elimina regresiones de idioma y facilita la revisión del copy sin tocar componentes.

## Sistemas y playbooks relacionados

- Proyecto matriz: [[Anclora Private Estates]]
- Sistema base: [[Sistema canónico de landing premium Anclora]]
- Contrato de familia: [[ANCLORA_ULTRA_PREMIUM_APP_CONTRACT|Anclora Ultra Premium App Contract]]

## Relacionado

- [[Ficha de producto - Anclora Private Estates Landing]]
- [[MOC - Fichas de producto Real Estate de Anclora Group]]
- [[Anclora Private Estates]]
- [[Sistema canónico de landing premium Anclora]]
- [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS|Anclora Ecosystem Contract Groups]]
- [[ANCLORA_ULTRA_PREMIUM_APP_CONTRACT|Anclora Ultra Premium App Contract]]
- [[personas/Toni|Toni]]

#proyecto #anclora #publicado
