---
title: Alta de Nueva Aplicación Anclora
objetivo: Dar de alta una nueva aplicación del ecosistema Anclora sin crear deuda de naming, gobernanza, branding o repositorios
ambito: ecosistema-apps
frecuencia: cuando nazca una nueva aplicación o superficie formal del ecosistema
estado: activo
herramientas: [Git, GitHub, Obsidian, workspace local]
tags: [playbook, apps, governance, branding, onboarding]
related:
  - "[[APPLICATION_FAMILY_MAP]]"
  - "[[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]]"
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[Anclora Group]]"
  - "[[Mapa del Sistema de Agentes]]"
---

# Alta de Nueva Aplicación Anclora

## 🎯 Objetivo

Dar de alta una nueva aplicación del ecosistema Anclora con un orden único y repetible: clasificación primero, registro canónico después, y solo entonces scaffolding técnico, repositorio y branding.

## 🧭 Cuándo usarlo

- Caso de uso: nace una nueva app, producto, portal, dashboard o superficie operativa estable del ecosistema.
- Señal de activación: ya existe un nombre tentativo, un propósito claro y decisión de construir algo como repo propio.
- Cuándo no aplica: ideas tempranas, experimentos sin nombre estable, prototipos descartables o notas de research todavía no promovidas.

## ✅ Precondiciones

- Existe una justificación clara de por qué esta app debe existir.
- El nombre de producto ya tiene un borrador razonable.
- Está claro si será una app interna, premium, ultra premium o portfolio.
- Si no encaja en ninguna familia actual, primero hay que resolver la gobernanza antes de crear el repo.

## 🪜 Pasos

1. Clasificar la app.
   Determinar su familia UX/UI en [[APPLICATION_FAMILY_MAP]] y su categoría de branding en [[ANCLORA_BRANDING_MASTER_CONTRACT]].

2. Registrar el alta en la bóveda.
   Crear una nota canónica mínima con:
   nombre del producto, nombre técnico previsto, propósito, familia UX/UI, categoría de branding, idiomas objetivo, tema objetivo, contratos aplicables, repo local previsto y repo GitHub previsto.

3. Reservar naming único.
   Confirmar que coinciden sin conflicto:
   - nombre de carpeta local
   - nombre del repo GitHub
   - nombre canónico del producto
   - slug público si va a tener URL propia

4. Crear carpeta local en el workspace.
   La carpeta debe crearse dentro del workspace `BOVEDA-ANCLORA` usando exactamente el nombre reservado.

5. Crear el repo en GitHub.
   El repo remoto debe usar exactamente el mismo nombre que la carpeta local.

6. Inicializar el repo local y enlazarlo con GitHub.
   Flujo mínimo:
   - `git init`
   - crear rama principal si hace falta
   - `git remote add origin <repo>`
   - primer commit base
   - `git push -u origin main`

7. Crear estructura mínima obligatoria.
   Toda app nueva debe nacer al menos con:
   - `README.md`
   - `docs/standards/`
   - `public/brand/`
   - `src/`
   - `.gitignore`

8. Copiar contratos aplicables.
   Siempre copiar:
   - `UI_MOTION_CONTRACT.md`
   - `MODAL_CONTRACT.md`
   - `LOCALIZATION_CONTRACT.md`

   Y además el contrato de familia correspondiente:
   - `ANCLORA_INTERNAL_APP_CONTRACT.md`
   - `ANCLORA_PREMIUM_APP_CONTRACT.md`
   - `ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`
   - `ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT.md`

9. Diseñar branding antes de construir UI.
   Leer y aplicar:
   - [[ANCLORA_BRANDING_MASTER_CONTRACT]]
   - [[ANCLORA_BRANDING_ICON_SYSTEM]]
   - [[ANCLORA_BRANDING_COLOR_TOKENS]]
   - [[ANCLORA_BRANDING_TYPOGRAPHY]]
   - [[ANCLORA_BRANDING_FAVICON_SPEC]]

   Entregables mínimos:
   - logo o icono canónico
   - favicon package
   - paleta base
   - tipografía asignada

10. Registrar el branding de la nueva app en los contratos canónicos.
    No basta con diseñarlo: hay que dejarlo documentado en la bóveda.
    Actualizar como mínimo:
    - [[ANCLORA_BRANDING_ICON_SYSTEM]] con borde, ondas, interior y hue
    - [[ANCLORA_BRANDING_COLOR_TOKENS]] con accent, secondary, surfaces y texto
    - [[ANCLORA_BRANDING_TYPOGRAPHY]] con stack asignado y migración si aplica
    - [[ANCLORA_BRANDING_FAVICON_SPEC]] si la app introduce prefijo, naming o paquete nuevo

11. Dejar constancia operativa en la bóveda.
    Actualizar como mínimo:
    - [[APPLICATION_FAMILY_MAP]]
    - la nota canónica de la nueva app
    - cualquier catálogo o MOC donde esa app deba aparecer

12. Solo entonces empezar implementación real.
    No arrancar UI, layout ni componentes sin clasificación, contratos y branding definidos.

## 🔎 Validación

- La app aparece clasificada en la bóveda.
- El repo local y el repo GitHub usan el mismo nombre.
- `origin` apunta al repo correcto.
- La estructura mínima existe en local.
- `docs/standards/` contiene los contratos obligatorios.
- `public/brand/` contiene al menos los activos mínimos de identidad.
- los contratos `ANCLORA_BRANDING_*` ya incluyen la nueva app con sus colores, tipografía e iconografía
- La nota canónica de la app ya existe y enlaza con el resto del ecosistema.

## ⚠️ Riesgos y rollback

- Riesgo principal: crear repos o carpetas antes de clasificar la app, generando nombres inconsistentes y deuda de gobernanza.
- Riesgo secundario: construir UI antes de fijar branding y contratos, obligando a rehacer parte del trabajo.
- Cómo deshacer o corregir:
  - si aún no hay push, renombrar carpeta y repo local antes de enlazar GitHub
  - si ya hay repo remoto, corregir naming y documentación en la misma ronda
  - si la app no está bien clasificada, parar implementación y resolver primero la familia y el branding

## 🔗 Relacionado

- [[APPLICATION_FAMILY_MAP]]
- [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]]
- [[ANCLORA_BRANDING_MASTER_CONTRACT]]
- [[Anclora Group]]
- [[MOC Stack Operativo Anclora]]

#playbook
