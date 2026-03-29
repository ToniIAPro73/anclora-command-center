# Anclora Internal Apps Gap Analysis

## Objetivo
Traducir los contratos internos del ecosistema a un plan de convergencia ejecutable para:

- `anclora-group`
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
- `anclora-group`: `es/en` + toggle visible de idioma + toggle visible de tema.
- `anclora-advisor-ai`: `es/en` + toggle visible de idioma + toggle visible de tema.
- `anclora-nexus`: `es/en/de/ru` + selector visible de idioma + contrato dark actual gobernado.
- `anclora-content-generator-ai`: `es/en` + toggle visible de idioma + toggle visible de tema.

---

## 1. anclora-group

### Estado actual observado
- Soporte de locales en código: `es/en/de/fr`.
- Soporte de tema en código: `dark/light`.
- No se detecta toggle visible de idioma.
- No se detecta toggle visible de tema.
- La capa parece más launcher corporativo que dashboard operativo clásico.

### Contrato objetivo
- Reducir contrato público a `es/en`.
- Exponer selector visible de idioma.
- Exponer toggle visible de tema.
- Mantenerse como launcher corporativo, pero con semántica interna compartida.

### Gap
- Gap alto en `idioma`: hay capacidad, pero no experiencia visible.
- Gap alto en `tema`: hay capacidad, pero no control visible.
- Gap medio en `shell`: necesita alinearse con la posición de accesos, cuenta, logout, idioma y tema.
- Gap medio en `componentes`: falta confirmar si botón/card/modal siguen un sistema reusable o están ad hoc.

### Qué habría que hacer
1. Limitar el contrato operativo a `es/en`.
2. Añadir `language toggle` visible en header o utility rail.
3. Añadir `theme toggle` visible con persistencia.
4. Definir variante base de botón primario corporativo.
5. Auditar modales y formularios si existen o aparecerán en roadmap inmediato.

### Prioridad
- `P0`: idioma y tema visibles.
- `P1`: sistema de botones/cards.
- `P1`: shell y utility zone.

---

## 2. anclora-advisor-ai

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

## 3. anclora-nexus

### Estado actual observado
- i18n visible con `es/en/de/ru`.
- Selector de idioma detectado.
- Layout en dark fijo.
- No se detecta toggle de tema.
- Tiene modales explícitos (`LeadFormModal`, `PropertyFormModal`, `TaskFormModal`).
- Tiene `button` y `card` propios.

### Contrato objetivo
- Mantener multilenguaje amplio.
- Mantener dark como contrato operativo actual.
- No forzar toggle de tema si estratégicamente no corresponde todavía.
- Sí obligar a que semántica de botones, cards y modales coincida con el ecosistema interno.

### Gap
- Gap bajo en idioma.
- Gap bajo-medio en tema si el producto va a seguir dark-only.
- Gap alto en contratos de modales: hay que auditar los tres modales y alinearlos.
- Gap medio-alto en botones/cards: tiene sistema propio y habrá que mapearlo a la semántica común.
- Gap medio en shell: hay header, sidebar, selector de idioma, user menu y notification panel, pero falta confirmar consistencia con el grupo interno.

### Qué habría que hacer
1. Auditar `frontend/src/components/ui/button.tsx`.
2. Auditar `frontend/src/components/ui/card.tsx`.
3. Auditar:
   - `TaskFormModal.tsx`
   - `PropertyFormModal.tsx`
   - `LeadFormModal.tsx`
4. Decidir explícitamente si Nexus sigue `dark-only` por contrato o si debe evolucionar a `dark/light`.
5. Alinear spacing, footer actions y cierre de modales con el contrato interno.

### Prioridad
- `P0`: modales.
- `P0`: semántica de botones.
- `P1`: cards y shell.
- `P2`: decisión estratégica sobre tema.

---

## 4. anclora-content-generator-ai

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
- `anclora-group`: toggle de idioma y tema.
- `anclora-content-generator-ai`: i18n `es/en` + toggle de idioma.
- `anclora-advisor-ai`: fijar baseline de contratos.

### Fase 2
- `anclora-nexus`: auditoría y alineación de modales.
- `anclora-content-generator-ai`: alineación de `button/card/dialog`.
- `anclora-group`: alineación de semántica visual.

### Fase 3
- Documentar la librería semántica interna compartida.
- Congelar checklist de revisión para cualquier nueva pantalla interna.

---

## Componentes a auditar repo por repo

### anclora-group
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/lib/group-ui.ts`

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

- `anclora-group` no se considera cumplidor por tener helpers de locale/theme sin toggle visible.
- `anclora-advisor-ai` es la referencia funcional más cercana al contrato interno.
- `anclora-content-generator-ai` debe converger a Advisor AI en idioma y tema.
- `anclora-nexus` mantiene una excepción controlada: multilenguaje amplio y dark fijo actual, salvo decisión posterior.
