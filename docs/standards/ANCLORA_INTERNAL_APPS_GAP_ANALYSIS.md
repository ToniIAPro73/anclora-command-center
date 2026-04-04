# Anclora Internal Apps Gap Analysis

## Objetivo
Traducir los contratos internos del ecosistema a un plan de convergencia ejecutable para:

- `anclora-advisor-ai`
- `anclora-nexus`
- `anclora-content-generator-ai`

Este documento separa:
- estado actual observado,
- contrato objetivo,
- gap real,
- prioridad de intervención.

## Contrato interno objetivo resumido

### Base común obligatoria
- Shell operativo coherente.
- Botones con semántica `primary / secondary / ghost / destructive`.
- Cards con gramática estable.
- Modales con el mismo contrato estructural.
- Inputs y formularios consistentes.
- Focus visible y contraste correcto.

### Idioma y tema por aplicación
- `anclora-advisor-ai`: `es/en` + toggle visible de idioma + toggle visible de tema.
- `anclora-nexus`: `es/en/de/ru` + selector visible de idioma + contrato dark actual gobernado.
- `anclora-content-generator-ai`: `es/en` + toggle visible de idioma + toggle visible de tema.

---

## 1. anclora-advisor-ai

### Estado actual observado
- Tiene `AppPreferencesProvider`.
- Tiene soporte real de `es/en`.
- Tiene `theme mode`: `dark/light/system`.
- Tiene persistencia de preferencias.
- Se comporta como la referencia más madura del grupo interno en idioma/tema.

### Contrato objetivo
- Mantenerse como baseline interna para:
  - preferences,
  - theme toggle,
  - language toggle,
  - shell operativo.

### Gap
- Gap bajo en idioma y tema.
- Gap medio en contratos visuales compartidos: no está claro aún que botón/card/modal sigan exactamente la misma gramática que deberán usar `group` y `content-generator`.
- Gap medio en modales: falta confirmar si todos siguen el mismo contrato estructural.
- Gap medio en tokens: puede tener estilos propios que hoy no estén documentados como contrato.

### Qué habría que hacer
1. Auditar `button`, `card`, `dialog/modal`, `input/select/textarea`.
2. Documentar Advisor AI como referencia interna.
3. Identificar qué piezas deben exportarse como contrato del grupo interno.
4. Evitar que evolucione de forma aislada respecto a `group` y `content-generator`.

### Prioridad
- `P0`: fijar Advisor AI como baseline contractual.
- `P1`: documentar componentes contractuales.

---

## 2. anclora-nexus

### Estado actual observado
- i18n visible con `es/en/de/ru`.
- Selector de idioma visible y ya operativo.
- `dark` fijo como contrato operativo real.
- `light` queda como posible evolución, no como requisito vigente.
- Tiene modales explícitos (`LeadFormModal`, `PropertyFormModal`, `TaskFormModal`).
- Tiene `button` y `card` propios.

### Contrato objetivo
- Mantener excepción controlada de idiomas: `es/en/de/ru`.
- Mantener `dark` como contrato operativo vigente.
- No exigir `light` en esta fase; queda como posible futuro.
- Alinear branding `dark`, shell y surfaces con el sistema interno.
- Hacer coincidir semántica de botones, cards y modales con el ecosistema interno.

### Gap
- Gap bajo en idioma.
- Gap intencional en `light`, porque no es requisito actual.
- Gap medio-alto en branding `dark`: wiring de logo, metadata y tipografía aún no estaba formalizado.
- Gap medio-alto en modales: hay que confirmar el cierre visual y acciones finales.
- Gap medio en shell: header, sidebar, selector de idioma, user menu y notification panel existen, pero requieren auditoría de coherencia.

### Qué habría que hacer
1. Auditar `frontend/src/components/ui/button.tsx`.
2. Auditar `frontend/src/components/ui/card.tsx`.
3. Auditar:
   - `TaskFormModal.tsx`
   - `PropertyFormModal.tsx`
   - `LeadFormModal.tsx`
4. Mantener `dark-only` como contrato actual y documentar `light` como futuro posible.
5. Alinear spacing, footer actions, logo wiring y cierre de modales con el contrato interno.

### Prioridad
- `P0`: branding `dark` y semántica de modales.
- `P0`: semántica de botones.
- `P1`: cards y shell.
- `P2`: decisión futura sobre `light` si llegara a activarse.

---

## 3. anclora-content-generator-ai

### Estado actual observado
- Tiene `ThemeProvider` con `next-themes`.
- Tiene `ThemeToggle` visible.
- No se detecta i18n formal equivalente a `advisor`.
- Tiene `button`, `card`, `dialog` y `surface-card` propios.
- Parece tener un sistema visual más moderno/aislado que puede divergir rápido.

### Contrato objetivo
- `es/en` obligatorios.
- Toggle visible de idioma.
- Toggle visible de tema.
- Semántica compartida de componentes con el resto del grupo interno.

### Gap
- Gap alto en idioma.
- Gap bajo en tema.
- Gap medio-alto en semántica de componentes: usa base distinta (`@base-ui/react`) y eso puede derivar en contratos visuales divergentes.
- Gap medio en modales: su `dialog.tsx` tiene estructura propia y hay que alinearla al contrato interno.

### Qué habría que hacer
1. Implementar proveedor i18n real `es/en`.
2. Añadir selector visible de idioma en topbar o utility zone.
3. Mapear `button.tsx` a la semántica interna común.
4. Alinear `dialog.tsx` al `Modal Contract` interno.
5. Ver si `surface-card.tsx` debe convivir con `card.tsx` o si está duplicando roles.

### Prioridad
- `P0`: i18n `es/en`.
- `P0`: toggle de idioma.
- `P1`: modales y botones.
- `P1`: racionalizar `surface-card` vs `card`.

---

## Priorización transversal

### Fase 1
- `anclora-content-generator-ai`: i18n `es/en` + toggle de idioma.
- `anclora-advisor-ai`: fijar baseline de contratos.

### Fase 2
- `anclora-nexus`: auditoría y alineación de modales.
- `anclora-content-generator-ai`: alineación de `button/card/dialog`.

### Fase 3
- Documentar la librería semántica interna compartida.
- Congelar checklist de revisión para cualquier nueva pantalla interna.

---

## Componentes a auditar repo por repo

### anclora-advisor-ai
- `src/components/providers/AppPreferencesProvider.tsx`
- `src/components/layout/DashboardTopbar.tsx`
- `src/app/globals.css`
- sistema de `button/card/dialog/input`

### anclora-nexus
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/modals/TaskFormModal.tsx`
- `frontend/src/components/modals/PropertyFormModal.tsx`
- `frontend/src/components/modals/LeadFormModal.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Sidebar.tsx`

### anclora-content-generator-ai
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/surface-card.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/theme/theme-provider.tsx`

---

## Decisiones ya fijadas

- `anclora-advisor-ai` es la referencia funcional más cercana al contrato interno.
- `anclora-content-generator-ai` debe converger a Advisor AI en idioma y tema.
- `anclora-nexus` mantiene una excepción controlada: multilenguaje amplio y dark fijo actual, salvo decisión posterior.
