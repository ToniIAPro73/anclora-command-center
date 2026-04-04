---
title: anclora-impulso branding regularization design
type: spec
estado: activo
scope: anclora-impulso
tags: [spec, branding, premium, anclora-impulso]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_COLOR_TOKENS]]"
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
  - "[[ANCLORA_BRANDING_TYPOGRAPHY]]"
  - "[[ANCLORA_BRANDING_FAVICON_SPEC]]"
---

# Anclora Impulso Branding Regularization

## Objetivo

Regularizar `anclora-impulso` contra los contratos `ANCLORA_BRANDING_*` como app `Premium`, dejando la bóveda y el repo real preparados estructuralmente para el branding canónico sin exigir todavía los assets finales del usuario ni cerrar el contrato premium completo.

## Alcance

Esta fase incluye:

- localizar o consolidar la referencia canónica de `anclora-impulso` en la bóveda y fijar su branding objetivo
- actualizar la evidencia contractual mínima en la matriz de cumplimiento, limitada a branding estructural
- adaptar el repo real `anclora-impulso` para usar una fuente única de verdad de branding
- migrar la base tipográfica a `DM Sans`
- alinear metadata, logo wiring y favicon wiring con el contrato premium
- ajustar los tokens base hacia la identidad naranja + cobre definida en los contratos
- añadir una prueba mínima de branding

Esta fase no incluye:

- diseñar un logo nuevo
- generar el paquete final de favicon
- rehacer por completo el dashboard, la landing o la gamificación
- cerrar la auditoría completa del contrato premium

## Estado actual

En el repo real, `anclora-impulso` usa estructura `app/`, `components/` y `lib/`, diferente a `anclora-data-lab` y `anclora-synergi`, pero el problema de fondo es el mismo:

- la app no está todavía gobernada por un módulo central de branding
- `README.md` sigue apuntando a `ANCLORA_INTERNAL_APP_CONTRACT.md`, lo que ya no coincide con su clasificación `Premium`
- la tipografía premium `DM Sans` todavía no consta como base canónica aplicada
- metadata, logo y favicon no están todavía estructurados bajo una sola fuente de verdad

La bóveda sí clasifica `anclora-impulso` como `Premium`, pero esta fase busca dejar esa clasificación reflejada también en el repo real y en la evidencia contractual de branding.

## Branding objetivo

`anclora-impulso` debe responder a este contrato:

- familia: `Premium`
- tipografía base: `DM Sans`
- borde del icono: cobre
- accent principal: naranja `#FF6A00`
- interior del icono: navy `#1A1C2B`
- favicon package esperado: prefijo `impulso_`

Los assets finales siguen pendientes y serán proporcionados por el usuario en una fase posterior.

## Enfoques considerados

### Opción 1. Ajuste estructural mínimo de branding

Centralizar la marca, cambiar tipografía, alinear metadata/logo/favicon wiring y reformular tokens base sin rediseñar toda la app.

Ventajas:

- mantiene el mismo patrón aplicado a `anclora-data-lab` y `anclora-synergi`
- riesgo bajo
- deja el repo preparado para sustituir assets sin otro refactor

Riesgos:

- no cierra todavía la coherencia visual completa entre todas las superficies premium del producto

### Opción 2. Refactor visual amplio

Incluir además una limpieza más profunda de landing, dashboard, auth y gamificación.

Ventajas:

- resultado visual más uniforme

Riesgos:

- mezcla branding con contrato premium completo
- rompe el límite de alcance acordado

### Opción 3. Solo documentación

Actualizar la bóveda y dejar una checklist sin tocar el repo real.

Ventajas:

- mínima inversión inmediata

Riesgos:

- la deuda estructural del branding seguiría viva

## Decisión

Se adopta la opción 1.

`anclora-impulso` se regularizará solo en la capa de branding estructural, con un cambio acotado y verificable tanto en la bóveda como en el repo real.

## Diseño de solución

### 1. Bóveda

Se localizará la nota o referencia canónica de `anclora-impulso` y se añadirá una sección `Branding canónico` con:

- familia visual
- accent objetivo
- tipografía objetivo
- borde e interior del icono
- estado de assets finales
- alcance exacto de la fase

También se actualizará `CONTRACT_COMPLIANCE_MATRIX.md` para reflejar que el branding estructural del repo ha sido alineado, dejando explícito que los assets finales y la auditoría visual completa siguen pendientes.

### 2. Repo real

Se creará un módulo de branding único para `anclora-impulso`.

Ese módulo concentrará:

- nombre de producto
- descripción canónica
- ruta del logo actual
- ruta del favicon actual o fallback temporal
- color principal naranja
- color cobre de grupo
- interior navy

### 3. Layout y metadata

`app/layout.tsx` pasará a leer branding y metadata desde el módulo central.

La base tipográfica se sustituirá por `DM Sans`, que es la fuente premium canónica. No se mantendrá una base tipográfica que contradiga el contrato premium.

### 4. Tokens base

`app/globals.css` se alineará a una base premium naranja + cobre:

- superficies y fondos coherentes con interior navy `#1A1C2B`
- accent principal alineado con `#FF6A00`
- borde/cromática de grupo alineada con cobre
- continuidad con la estructura actual de clases y componentes, evitando un rediseño global

La meta no es rehacer la aplicación, sino recolocarla dentro del sistema de branding correcto.

### 5. Componentes visibles

Se revisarán los puntos donde hoy se referencia el logo y el naming para conectarlos al módulo de branding central, empezando por:

- `app/layout.tsx`
- `components/brand-logo.tsx`
- superficies principales donde la marca esté renderizada directamente

Esto dejará preparada la app para sustituir assets cuando el usuario los entregue.

### 6. Verificación

Se añadirá una prueba mínima de branding que verifique:

- nombre canónico
- ruta de logo activa
- accent premium correcto
- color cobre correcto
- presencia del contrato tipográfico esperado

Además, se ejecutarán:

- `pnpm lint` o el comando de lint equivalente del repo
- `pnpm test:ci` o el comando de test no interactivo equivalente
- `pnpm build`

## Riesgos residuales aceptados

- el logo final todavía no será el definitivo
- el favicon final seguirá pendiente si el asset aún no existe
- el resultado no debe venderse como cierre completo del contrato premium, solo como cierre de branding estructural

## Resultado esperado

Al terminar esta fase:

- la bóveda describirá `anclora-impulso` como premium con branding canónico explícito
- el repo real usará una fuente de verdad única de branding
- la app quedará alineada con `DM Sans`
- el sistema visual base estará orientado a premium naranja + cobre
- quedará preparada para integrar los assets finales sin nuevo refactor
