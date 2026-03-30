# Application Family Map

## Objetivo

Mantener un único mapa de clasificación de aplicaciones para saber qué contratos debe consultar y cumplir cada repositorio del ecosistema.

## Familias

### Universal

Aplican a todas las apps:
- `UI_MOTION_CONTRACT.md`
- `MODAL_CONTRACT.md`
- `LOCALIZATION_CONTRACT.md`

### Internal

Contrato de familia:
- `ANCLORA_INTERNAL_APP_CONTRACT.md`

Aplicaciones:
- `anclora-group`
- `anclora-advisor-ai`
- `anclora-nexus`
- `anclora-content-generator-ai`

### Premium

Contrato de familia:
- `ANCLORA_PREMIUM_APP_CONTRACT.md`

Aplicaciones:
- `anclora-impulso`
- `Boveda-Anclora/dashboard`
- `anclora-data-lab`
- `anclora-synergi`

### Ultra Premium

Contrato de familia:
- `ANCLORA_ULTRA_PREMIUM_APP_CONTRACT.md`

Aplicaciones:
- `anclora-private-estates`

### Portfolio / Showcase

Contrato de familia:
- `ANCLORA_PORTFOLIO_SHOWCASE_CONTRACT.md`

Aplicaciones:
- `anclora-portfolio`
- `anclora-azure-bay-landing`
- `anclora-playa-viva-uniestate`

## Tabla canónica

| Aplicación | Familia | Contratos aplicables |
| --- | --- | --- |
| `anclora-group` | Internal | Universal + Internal |
| `anclora-advisor-ai` | Internal | Universal + Internal |
| `anclora-nexus` | Internal | Universal + Internal |
| `anclora-content-generator-ai` | Internal | Universal + Internal |
| `anclora-impulso` | Premium | Universal + Premium |
| `Boveda-Anclora/dashboard` | Premium | Universal + Premium |
| `anclora-data-lab` | Premium | Universal + Premium |
| `anclora-synergi` | Premium | Universal + Premium |
| `anclora-private-estates` | Ultra Premium | Universal + Ultra Premium |
| `anclora-portfolio` | Portfolio / Showcase | Universal + Portfolio |
| `anclora-azure-bay-landing` | Portfolio / Showcase | Universal + Portfolio |
| `anclora-playa-viva-uniestate` | Portfolio / Showcase | Universal + Portfolio |

## Regla de alta de nuevas apps

Toda aplicación nueva debe:

1. clasificarse en una familia antes de empezar a construir UI
2. copiar a su repo el set contractual mínimo correspondiente
3. documentar cualquier excepción local en su `docs/standards/`

No se debe crear una app nueva sin clasificar su familia contractual.
