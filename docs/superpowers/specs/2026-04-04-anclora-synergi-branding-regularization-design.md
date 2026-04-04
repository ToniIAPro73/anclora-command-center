---
title: anclora-synergi branding regularization design
type: spec
estado: activo
scope: anclora-synergi
tags: [spec, branding, premium, anclora-synergi]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
  - "[[ANCLORA_BRANDING_TYPOGRAPHY]]"
  - "[[ANCLORA_BRANDING_FAVICON_SPEC]]"
  - "[[Anclora Synergi]]"
---

# Anclora Synergi Branding Regularization

## Objetivo

Regularizar `anclora-synergi` contra los contratos `ANCLORA_BRANDING_*` como app `Premium`, dejando el repo y la bóveda preparados estructuralmente para el branding canónico sin exigir todavía los assets finales del usuario ni cerrar el contrato premium completo.

## Alcance

Esta fase incluye:

- actualización de la nota canónica en la bóveda con el branding objetivo de Synergi
- evidencia contractual mínima en la matriz de cumplimiento, limitada a branding estructural
- adaptación del repo real `anclora-synergi` para usar una fuente única de verdad de branding
- migración tipográfica a `DM Sans`
- alineación de metadata, logo wiring y favicon wiring con el contrato premium
- ajuste de los tokens base hacia la identidad púrpura + cobre definida en los contratos
- test mínimo que verifique el contrato de branding

Esta fase no incluye:

- diseño de un logo nuevo
- generación del paquete final de favicon
- rediseño completo de la app o cierre total del contrato premium
- auditoría visual exhaustiva de todo el backoffice

## Estado actual

En el repo real, `anclora-synergi` todavía arrastra una base tipográfica y visual que no coincide con el branding premium vigente:

- `layout.tsx` usa `Cardo` e `Inter`
- `globals.css` está construido sobre una identidad visual previa con mezcla de registros que no responde al contrato premium actual
- el logo y la metadata están cableados de forma local, no desde un módulo central
- no existe una prueba específica de branding

La bóveda ya clasifica `anclora-synergi` como `Premium`, pero su nota canónica todavía no documenta el branding objetivo con el mismo nivel de claridad que `anclora-data-lab`.

## Branding objetivo

`anclora-synergi` debe responder a este contrato:

- familia: `Premium`
- tipografía base: `DM Sans`
- borde del icono: cobre
- accent principal: púrpura `#8C5AB4`
- interior del icono: navy púrpura `#1C162A`
- favicon package esperado: prefijo `synergi_`

Los assets finales siguen pendientes y serán proporcionados por el usuario en una fase posterior.

## Enfoques considerados

### Opción 1. Ajuste estructural mínimo de branding

Centralizar la marca, cambiar tipografía, alinear metadata/logo/favicon wiring y reformular tokens base sin rediseñar pantallas completas.

Ventajas:

- riesgo bajo
- coherente con el patrón ya aplicado a `anclora-data-lab`
- deja el repo preparado para sustituir assets sin más refactor

Riesgos:

- no cierra todavía la coherencia visual fina de todas las superficies

### Opción 2. Refactor visual amplio

Incluir también una limpieza más profunda de cards, chips, layouts y jerarquía visual del backoffice.

Ventajas:

- resultado visual más pulido

Riesgos:

- mezcla branding con contrato premium completo
- rompe el límite de alcance acordado

### Opción 3. Solo documentación

Actualizar la bóveda y dejar una checklist de gaps sin tocar el repo real.

Ventajas:

- mínima inversión inmediata

Riesgos:

- el incumplimiento estructural seguiría vivo

## Decisión

Se adopta la opción 1.

`anclora-synergi` se regularizará solo en la capa de branding estructural, con un cambio contenido y verificable tanto en la bóveda como en el repo real.

## Diseño de solución

### 1. Bóveda

Se añadirá una sección `Branding canónico` en `research/anclora/anclora-synergi.md` con:

- familia visual
- accent objetivo
- tipografía objetivo
- borde e interior del icono
- estado de assets finales
- alcance exacto de la fase

También se ajustará `CONTRACT_COMPLIANCE_MATRIX.md` para reflejar que el branding estructural del repo ha sido alineado, dejando explícito que los assets finales y la auditoría visual completa siguen pendientes.

### 2. Repo real

Se creará un módulo de branding único para `anclora-synergi`, equivalente funcionalmente al patrón ya usado en `anclora-data-lab`.

Ese módulo concentrará:

- nombre de producto
- descripción canónica
- ruta del logo actual
- ruta del favicon actual o fallback temporal
- color principal púrpura
- color cobre de grupo

### 3. Layout y metadata

`src/app/layout.tsx` pasará a leer branding y metadata desde ese módulo central.

También se sustituirá la configuración tipográfica actual por `DM Sans`, que es la fuente premium canónica. No se mantendrá `Cardo`, ya que queda reservada para `Ultra Premium`.

### 4. Tokens base

`src/app/globals.css` se alineará a una base premium púrpura + cobre:

- superficies y fondos coherentes con interior navy púrpura
- accent principal alineado con `#8C5AB4`
- borde/cromática de grupo alineada con cobre
- continuidad con la estructura actual de clases, evitando un rediseño general

La meta no es rehacer el look completo, sino recolocar la app dentro del sistema de branding correcto.

### 5. Componentes visibles

Los puntos donde hoy se referencia el logo y el naming se conectarán al módulo de branding central:

- shell principal
- login
- entry pública
- backoffice / partner admissions

Esto dejará preparada la app para sustituir assets cuando el usuario los entregue.

### 6. Verificación

Se añadirá un test mínimo de branding que verifique:

- nombre canónico
- ruta de logo activa
- accent premium correcto
- color cobre correcto
- presencia del contrato tipográfico esperado

Además, se ejecutarán:

- `npm run lint`
- `npm run test`
- `npm run build`

## Riesgos residuales aceptados

- el logo final todavía no será el definitivo
- el favicon final seguirá pendiente si el asset aún no existe
- el resultado no debe venderse como cierre completo del contrato premium, solo como cierre de branding estructural

## Resultado esperado

Al terminar esta fase:

- la bóveda describirá `anclora-synergi` como premium con branding canónico explícito
- el repo real usará una fuente de verdad única de branding
- la app dejará de depender de `Cardo`
- el sistema visual base estará alineado a premium púrpura + cobre
- quedará preparada para integrar los assets finales sin nuevo refactor
