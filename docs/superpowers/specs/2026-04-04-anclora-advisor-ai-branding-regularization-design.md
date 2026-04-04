---
title: anclora-advisor-ai branding regularization design
type: spec
estado: activo
scope: anclora-advisor-ai
tags: [spec, branding, internal, anclora-advisor-ai]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_INTERNAL_APP_CONTRACT]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
  - "[[ANCLORA_BRANDING_TYPOGRAPHY]]"
  - "[[ANCLORA_BRANDING_FAVICON_SPEC]]"
---

# Anclora Advisor AI Branding Regularization

## Objetivo

Regularizar `anclora-advisor-ai` contra el contrato `ANCLORA_INTERNAL_APP_CONTRACT` como app `Internal` y baseline de referencia interna, dejando la bóveda y el repo real preparados estructuralmente para el branding canónico sin exigir todavía los assets finales del usuario ni cerrar el contrato interno completo.

## Alcance

Esta fase incluye:

- consolidar la referencia canónica de `anclora-advisor-ai` en la bóveda y fijar su branding objetivo interno
- actualizar la evidencia contractual mínima en la matriz de cumplimiento, limitada a branding estructural
- adaptar el repo real `anclora-advisor-ai` para usar una fuente única de verdad de branding (`lib/advisor-brand.ts`)
- alinear metadata, logo wiring y favicon wiring con el contrato interno
- preparar la estructura de tokens para recibir la nueva paleta sin rehacerla ahora
- añadir una prueba mínima de branding

Esta fase no incluye:

- diseñar un icono nuevo
- generar el paquete final de favicon
- rehacer el dashboard, los workspaces o el sistema de chat
- aplicar los otros contratos internos (motion, modal, localización)
- cerrar la auditoría completa del contrato interno

## Estado actual

En el repo real, `anclora-advisor-ai` ya tiene:

- preferencias persistidas (`AppPreferencesProvider` + `AppPreferencesScript`)
- `dark/light/system` toggle funcional
- `es/en` con localStorage
- shell: header operativo + navegación persistente + área principal
- sistema de tokens CSS en `globals.css` con prefijo `advisor-`
- tipografía: Cormorant Garamond (display) + Source Sans 3 (body)

Lo que falta:

- no existe módulo central de branding (`lib/advisor-brand.ts`)
- `README.md` no tiene sección de branding canónico
- metadata, logo y favicon no están estructurados bajo una sola fuente de verdad
- no hay favicon registrado en metadata
- no hay prueba de contrato de branding

## Branding objetivo

`anclora-advisor-ai` debe responder a este contrato:

- familia: `Internal`
- rol: baseline de referencia interna (preferencias, temas, i18n)
- tipografía display: `Cormorant Garamond`
- tipografía body: `Source Sans 3`
- accent principal: mint `#1dab89` (placeholder — usuario entregará nueva paleta)
- primary base: navy `#162944` (placeholder — usuario entregará nueva paleta)
- prefijo de assets: `advisor_`
- favicon package: pendiente de assets del usuario

Los assets finales (icono y paleta) siguen pendientes y serán proporcionados por el usuario en una fase posterior.

## Enfoques considerados

### Opción 1. Ajuste estructural mínimo de branding

Centralizar la marca, alinear metadata/logo/favicon wiring y preparar la estructura de tokens sin cambiar la paleta actual ni rediseñar la app.

Ventajas:

- mismo patrón aplicado a `anclora-nexus`, `anclora-impulso`, `anclora-data-lab` y `anclora-synergi`
- riesgo bajo
- deja el repo preparado para sustituir assets sin otro refactor

Riesgos:

- no cierra todavía la coherencia visual completa del producto

### Opción 2. Refactor visual amplio

Incluir además limpieza de workspaces, chat y auth.

Ventajas:

- resultado visual más uniforme

Riesgos:

- mezcla branding con contrato interno completo
- rompe el límite de alcance acordado

### Opción 3. Solo documentación

Actualizar la bóveda y dejar checklist sin tocar el repo.

Riesgos:

- la deuda estructural del branding seguiría viva

## Decisión

Se adopta la opción 1.

`anclora-advisor-ai` se regularizará solo en la capa de branding estructural, con un cambio acotado y verificable tanto en la bóveda como en el repo real.

## Diseño de solución

### 1. Bóveda

Se actualizará la nota canónica de `anclora-advisor-ai` añadiendo una sección `Branding canónico` con:

- familia visual
- tipografía display y body
- accent placeholder y base palette placeholder
- estado de assets finales
- alcance exacto de la fase

También se actualizará `CONTRACT_COMPLIANCE_MATRIX.md` para reflejar que el branding estructural del repo ha sido alineado, dejando explícito que los assets finales y la auditoría visual completa siguen pendientes.

### 2. Repo real

Se creará un módulo de branding único `src/lib/advisor-brand.ts` que concentrará:

- nombre de producto
- descripción canónica
- familia y rol interno
- tipografía display y body
- colores actuales como placeholders
- ruta del logo actual
- ruta del favicon (pendiente)

### 3. Layout y metadata

`src/app/layout.tsx` pasará a leer nombre, descripción e icons desde el módulo central. Se añadirá entrada de `icons` en metadata apuntando a `/brand/favicon.ico` como placeholder.

### 4. Tokens base

No se cambia la paleta actual. La estructura de tokens en `globals.css` ya es correcta. Solo se prepara la superficie de recepción documentando que la paleta actual es placeholder hasta que el usuario entregue los nuevos assets.

### 5. Verificación

Se añadirá una prueba mínima de branding (`tests/unit/test-advisor-brand.ts`, ejecutable con `tsx`) que verificará:

- nombre canónico
- familia interna
- ruta de logo activa
- tipografía display y body canónicas

## Riesgos residuales aceptados

- el logo final todavía no será el definitivo
- el favicon final seguirá pendiente hasta que el usuario entregue los assets
- el resultado no es cierre completo del contrato interno, solo cierre de branding estructural

## Resultado esperado

Al terminar esta fase:

- la bóveda describirá `anclora-advisor-ai` como Internal con branding canónico explícito
- el repo real usará una fuente de verdad única de branding
- metadata y favicon estarán estructuralmente preparados para recibir assets definitivos
- quedará lista para integrar la nueva paleta e icono sin refactor adicional
