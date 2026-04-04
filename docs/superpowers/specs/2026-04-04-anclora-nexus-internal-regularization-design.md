---
title: anclora-nexus regularización interna
type: spec
estado: activo
tags: [spec, anclora-nexus, internal, branding, governance]
related:
  - "[[APPLICATION_FAMILY_MAP]]"
  - "[[ANCLORA_INTERNAL_APP_CONTRACT]]"
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[Anclora Nexus]]"
---

# anclora-nexus regularización interna

## Objetivo

Regularizar `anclora-nexus` como si su alta y evolución hubieran seguido correctamente el sistema actual desde el principio. Esta fase repite el patrón ya aplicado a `anclora-group`, pero adaptado a una app del grupo `Internal`:

1. actualizar la bóveda y la nota canónica
2. auditar el repo real contra contratos UX/UI + branding
3. adaptar la implementación donde haya incumplimientos estructurales

## Contexto

`anclora-nexus` ya está clasificada como app `Internal`, pero arrastra dos particularidades importantes que deben quedar explícitas en el diseño:

- mantiene una cobertura de idioma más amplia que el resto del grupo: `es/en/de/ru`
- opera actualmente con `dark` como contrato real de uso

La decisión validada para esta fase es:

- `anclora-nexus` **sigue siendo `Internal`**
- la excepción multilenguaje `es/en/de/ru` se mantiene
- `dark` sigue siendo el contrato operativo obligatorio
- `light` no se exige en esta fase y queda como **posible futuro**
- el branding `dark` sí debe alinearse con:
  - `ANCLORA_BRANDING_COLOR_TOKENS.md`
  - `ANCLORA_BRANDING_TYPOGRAPHY.md`
  - `ANCLORA_BRANDING_ICON_SYSTEM.md`
  - `ANCLORA_BRANDING_FAVICON_SPEC.md`

## Resultado esperado

Al finalizar esta fase:

- la bóveda describe `anclora-nexus` como app `Internal` con excepción multilenguaje y dark operativo
- la nota canónica de Nexus queda reescrita con contratos, branding y excepciones visibles
- el repo `anclora-nexus` queda auditado y ajustado al branding `dark` correcto
- cualquier gap residual queda documentado como deuda explícita, no como ambigüedad

## Decisiones de diseño

### 1. Familia contractual

`anclora-nexus` sigue gobernada por:

- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`
- `ANCLORA_INTERNAL_APP_CONTRACT.md`

Además, en branding debe alinearse con:

- `ANCLORA_BRANDING_MASTER_CONTRACT.md`
- `ANCLORA_BRANDING_ICON_SYSTEM.md`
- `ANCLORA_BRANDING_COLOR_TOKENS.md`
- `ANCLORA_BRANDING_TYPOGRAPHY.md`
- `ANCLORA_BRANDING_FAVICON_SPEC.md`

Y mantiene como capa específica propia sus contratos de `sdd/contracts/`, que no se invalidan, sino que se leen como concreción local del grupo `Internal`.

### 2. Excepción de idioma

La app no converge en esta fase a `es/en`. Se acepta explícitamente la excepción:

- `es`
- `en`
- `de`
- `ru`

Esto obliga a revisar no solo que el i18n exista, sino que no contradiga el contrato interno en:

- mezcla de idiomas por vista
- overflows de layout
- labels y navegación
- consistencia de toggles o selectores si existen

### 3. Contrato de tema

La app se toma como `dark-first` y `dark-only` operativo en esta fase. Eso significa:

- `dark` sí se audita y debe cumplir branding
- `light` no bloquea cumplimiento ahora
- `light` debe quedar documentado como posibilidad futura, no como requisito pendiente inmediato

### 4. Branding aplicable

Para `anclora-nexus`, el branding relevante en esta fase no consiste en diseñar nuevos activos, sino en verificar y adaptar:

- tipografía interna correcta según contrato
- palette/tokens `dark` coherentes con la app
- wiring de icono/logo/favicon compatible con la spec
- coherencia entre shell, cards y surfaces respecto a la identidad `Internal`

No se generarán nuevos logos ni favicons finales. Si faltan assets definitivos del usuario, se dejará el repo preparado para recibirlos sin rehacer estructura.

## Superficies a revisar en el repo

El repo `anclora-nexus` usa una estructura con:

- raíz operativa
- `frontend/` como superficie principal
- `sdd/contracts/` como capa de detalle contractual local

La auditoría de implementación debe centrarse en:

- shell principal
- tema `dark`
- tokens y semántica de color
- tipografía
- metadata e icon wiring
- i18n real en vistas principales
- consistencia entre branding global y contratos `sdd/contracts`

## Documentos a actualizar en la bóveda

Mínimo:

- `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- `docs/standards/ANCLORA_INTERNAL_APPS_GAP_ANALYSIS.md`
- nota canónica de `anclora-nexus` en la bóveda

Probablemente también:

- `resources/anclora-group-chatgpt-project/*` si hay referencias operativas desalineadas
- MOCs o notas de research donde `Nexus` aparezca sin la nueva aclaración contractual

## Verificación requerida

### Bóveda

- `anclora-nexus` aparece correctamente como `Internal`
- la excepción `es/en/de/ru` queda documentada
- la condición `dark` operativa queda documentada
- la nota canónica deja visibles contratos y branding aplicables

### Repo real

- `dark` real cumple razonablemente el branding contract
- la tipografía real no contradice el contrato
- el wiring de icon/logo/favicon es compatible con la spec
- los idiomas activos no rompen layout ni consistencia contractual en lo auditado
- los tests y la build siguen pasando tras la adaptación

## Riesgos

- intentar forzar `light` cuando no forma parte del objetivo actual
- tratar la excepción multilenguaje como una desviación informal en lugar de una excepción controlada
- dejar sin reconciliar los contratos `sdd/contracts` con la nueva capa de branding

## Fuera de alcance

Esta fase no aborda todavía:

- convergencia de `anclora-nexus` a `es/en`
- implementación completa de `light`
- rediseño de producto más allá del cumplimiento contractual y branding estructural
- regularización de las demás apps internas

## Recomendación de ejecución

La mejor ruta sigue siendo la misma que ya fijamos para el resto:

1. bóveda y nota canónica
2. auditoría del repo real
3. adaptación del repo
4. verificación, commit y push
