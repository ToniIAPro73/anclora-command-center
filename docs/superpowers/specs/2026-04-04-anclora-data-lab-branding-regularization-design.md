---
title: 2026-04-04 anclora-data-lab branding regularization design
type: spec
estado: borrador
scope: anclora-data-lab
tags: [spec, anclora, data-lab, branding, premium]
related:
  - "[[APPLICATION_FAMILY_MAP]]"
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
  - "[[ANCLORA_BRANDING_TYPOGRAPHY]]"
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
  - "[[ANCLORA_BRANDING_FAVICON_SPEC]]"
---

# Anclora Data Lab Branding Regularization Design

## Objetivo

Regularizar `anclora-data-lab` únicamente contra los contratos de branding del ecosistema Anclora, dejándola preparada estructuralmente para recibir los assets finales de marca cuando estén disponibles.

## Alcance

Esta fase incluye:

- confirmar en la bóveda que `anclora-data-lab` está clasificada como `Premium`
- verificar que su branding objetivo responde al grupo `Premium`
- auditar el repo real solo en los puntos afectados por branding
- adaptar la app para cumplir estructuralmente con:
  - `ANCLORA_BRANDING_MASTER_CONTRACT`
  - `ANCLORA_BRANDING_ICON_SYSTEM`
  - `ANCLORA_BRANDING_COLOR_TOKENS`
  - `ANCLORA_BRANDING_TYPOGRAPHY`
  - `ANCLORA_BRANDING_FAVICON_SPEC`

Esta fase no incluye:

- rediseño funcional de UX/UI fuera de branding
- cierre del contrato premium completo
- creación de logo final, favicon final o paquete definitivo de assets
- auditoría visual exhaustiva pantalla por pantalla

## Supuestos de trabajo

- `anclora-data-lab` mantiene la clasificación `Premium`
- su identidad debe usar:
  - borde `cobre`
  - accent `esmeralda #2DA078`
  - interior `navy verde #12201C`
  - tipografía `DM Sans`
- el usuario entregará más adelante los assets finales de logo y favicon
- mientras tanto, la app debe quedar lista para sustituir esos assets sin rehacer wiring

## Resultado esperado

Al cerrar esta fase:

- la bóveda reflejará correctamente el branding premium objetivo de `anclora-data-lab`
- el repo tendrá una fuente de verdad clara para nombre, colores, tipografía, iconos y locales relevantes al branding
- la app no dependerá de rutas dispersas o decisiones visuales incoherentes con los contratos
- los puntos de entrada de marca quedarán preparados para reemplazar activos temporales por activos finales

## Puntos de auditoría previstos en el repo

La revisión se concentrará en:

- metadata de la app
- wiring de logo, icon y favicon
- tokens base de color
- tipografía cargada y declarada
- shell o superficies principales en la medida en que afecten a color y tipografía

## Criterio de cumplimiento de esta fase

`anclora-data-lab` se considerará regularizada para branding si:

- su wiring de marca usa una fuente de verdad única o claramente centralizada
- su tipografía responde al grupo `Premium`
- sus tokens base responden al contrato premium de Data Lab
- su favicon/logo quedan preparados para el paquete final aunque el asset definitivo todavía no exista
- `lint`, `test` y `build` siguen pasando

## Riesgo aceptado

Puede quedar pendiente un último ajuste visual cuando el usuario entregue:

- logo final
- favicon package final
- cualquier refinamiento fino de paleta si la versión contractual vuelve a cambiar

Eso no invalida esta fase, porque aquí el objetivo es dejar la estructura correcta, no cerrar la identidad visual definitiva.
