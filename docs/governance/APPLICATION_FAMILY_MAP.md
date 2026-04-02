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
- `anclora-talent`

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

| Aplicación | Familia | Contratos universales | Contrato de familia | Override local permitido |
| --- | --- | --- | --- | --- |
| `anclora-group` | Internal | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `INTERNAL` | Sí |
| `anclora-advisor-ai` | Internal | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `INTERNAL` | Sí |
| `anclora-nexus` | Internal | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `INTERNAL` | Sí |
| `anclora-content-generator-ai` | Internal | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `INTERNAL` | Sí |
| `anclora-impulso` | Premium | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PREMIUM` | Sí |
| `Boveda-Anclora/dashboard` | Premium | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PREMIUM` | Sí |
| `anclora-data-lab` | Premium | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PREMIUM` | Sí |
| `anclora-synergi` | Premium | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PREMIUM` | Sí |
| `anclora-talent` | Premium | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PREMIUM` | Sí |
| `anclora-private-estates` | Ultra Premium | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `ULTRA_PREMIUM` | Sí |
| `anclora-portfolio` | Portfolio / Showcase | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PORTFOLIO` | Sí |
| `anclora-azure-bay-landing` | Portfolio / Showcase | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PORTFOLIO` | Sí |
| `anclora-playa-viva-uniestate` | Portfolio / Showcase | `UI_MOTION` + `MODAL` + `LOCALIZATION` | `PORTFOLIO` | Sí |

## Agrupación operativa

### Internal

| Aplicación | Set mínimo de contratos |
| --- | --- |
| `anclora-group` | Universal + Internal |
| `anclora-advisor-ai` | Universal + Internal |
| `anclora-nexus` | Universal + Internal |
| `anclora-content-generator-ai` | Universal + Internal |

### Premium

| Aplicación | Set mínimo de contratos |
| --- | --- |
| `anclora-impulso` | Universal + Premium |
| `Boveda-Anclora/dashboard` | Universal + Premium |
| `anclora-data-lab` | Universal + Premium |
| `anclora-synergi` | Universal + Premium |
| `anclora-talent` | Universal + Premium |

### Ultra Premium

| Aplicación | Set mínimo de contratos |
| --- | --- |
| `anclora-private-estates` | Universal + Ultra Premium |

### Portfolio / Showcase

| Aplicación | Set mínimo de contratos |
| --- | --- |
| `anclora-portfolio` | Universal + Portfolio |
| `anclora-azure-bay-landing` | Universal + Portfolio |
| `anclora-playa-viva-uniestate` | Universal + Portfolio |

## Regla de alta de nuevas apps

Toda aplicación nueva debe:

1. clasificarse en una familia antes de empezar a construir UI
2. copiar a su repo el set contractual mínimo correspondiente
3. documentar cualquier excepción local en su `docs/standards/`

No se debe crear una app nueva sin clasificar su familia contractual.
