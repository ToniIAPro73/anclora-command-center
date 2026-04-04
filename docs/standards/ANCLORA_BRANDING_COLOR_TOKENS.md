---
title: ANCLORA_BRANDING_COLOR_TOKENS
type: standard
estado: activo
scope: branding
tags: [branding, standards, anclora, color-tokens]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
---

# ANCLORA_BRANDING_COLOR_TOKENS

> Referencia: [[ANCLORA_BRANDING_MASTER_CONTRACT]]

## Objetivo

Definir los tokens CSS de color para cada aplicación del ecosistema. Cada app utiliza tokens compartidos de su grupo más tokens individuales derivados de su color de acento (definido en [[ANCLORA_BRANDING_ICON_SYSTEM]]).

## Estructura de tokens por app

| Grupo | Tokens | Origen |
|-------|--------|--------|
| Surfaces | `--background`, `--surface`, `--card`, `--elevated`, `--hover` | Individual (tinte de interior del icono) |
| Accent | `--accent`, `--accent-hover`, `--accent-dim`, `--accent-soft`, `--accent-glow`, `--accent-border` | Individual (color de ondas del icono) |
| Secondary | `--secondary`, `--secondary-soft`, `--secondary-border` | Individual |
| Sidebar | `--sidebar`, `--sidebar-border`, `--sidebar-active` | Individual |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-accent` | Individual (tinte de grupo) |
| Semántico | `--danger`, `--success`, `--warning` + `-soft` | Compartido global |
| Estructura | `--radius-*`, `--shadow-*`, `--border-*` | Compartido por grupo |

---

## Tokens compartidos globales

```css
/* ── Semántico ── */
--danger: #E53E3E;
--danger-soft: rgba(229, 62, 62, 0.12);
--success: #38A169;
--success-soft: rgba(56, 161, 105, 0.12);
--warning: #D69E2E;
--warning-soft: rgba(214, 158, 46, 0.12);
```

## Tokens compartidos — Internas

```css
--radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-full: 9999px;
--border-subtle: rgba(255, 255, 255, 0.08);
--border-default: rgba(255, 255, 255, 0.12);
--border-strong: rgba(255, 255, 255, 0.20);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.20);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.28);
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.36);
```

## Tokens compartidos — Premium

```css
--radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-full: 9999px;
--border-subtle: rgba(255, 255, 255, 0.08);
--border-default: rgba(255, 255, 255, 0.12);
--border-strong: rgba(255, 255, 255, 0.20);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.22);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.30);
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.38);
```

## Tokens compartidos — Ultra Premium

```css
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 20px; --radius-full: 9999px;
--border-subtle: rgba(212, 175, 55, 0.12);
--border-default: rgba(212, 175, 55, 0.20);
--border-strong: rgba(212, 175, 55, 0.30);
--shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.18);
--shadow-md: 0 16px 48px rgba(0, 0, 0, 0.28);
--shadow-lg: 0 30px 90px rgba(0, 0, 0, 0.38);
--shadow-gold: 0 15px 35px rgba(212, 175, 55, 0.20);
--shadow-gold-hover: 0 20px 45px rgba(212, 175, 55, 0.30);
```

---

## Anclora Group (Entidad Matriz)

Accent: Silver `#A8AEB8` | Secondary: — | Tipografía: Georgia, serif

### Dark
```css
:root {
  --background: #0F1520; --surface: #151C28; --card: #1A2230;
  --elevated: #202A38; --hover: #263040;
  --accent: #A8AEB8; --accent-hover: #BCC2CC; --accent-dim: #8A909A;
  --accent-soft: rgba(168, 174, 184, 0.12); --accent-glow: rgba(168, 174, 184, 0.08);
  --accent-border: rgba(168, 174, 184, 0.25);
  --sidebar: #111925; --sidebar-border: rgba(168, 174, 184, 0.10);
  --sidebar-active: rgba(168, 174, 184, 0.14);
  --text-primary: #ECF0F5; --text-secondary: #B0BEC5;
  --text-muted: #728694; --text-on-accent: #0F1520;
}
```
### Light
```css
[data-theme='light'] {
  --background: #F4F6F8; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #F0F2F5; --hover: #E8ECF0;
  --accent: #5C6370; --accent-hover: #4A5060;
  --accent-soft: rgba(92, 99, 112, 0.08);
  --sidebar: #EAEDF2; --text-primary: #101820;
  --text-secondary: #4A5568; --text-muted: #8492A6; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Advisor AI (Interna)

Accent: Teal `#1DAB89` | Secondary: Mint `#A1DBC6`

### Dark
```css
:root {
  --background: #101E30; --surface: #152438; --card: #1A2C42;
  --elevated: #20344C; --hover: #263C56;
  --accent: #1DAB89; --accent-hover: #22C49E; --accent-dim: #17987A;
  --accent-soft: rgba(29, 171, 137, 0.12); --accent-glow: rgba(29, 171, 137, 0.10);
  --accent-border: rgba(29, 171, 137, 0.30);
  --secondary: #A1DBC6; --secondary-soft: rgba(161, 219, 198, 0.10);
  --secondary-border: rgba(161, 219, 198, 0.18);
  --sidebar: #132133; --sidebar-border: rgba(161, 219, 198, 0.12);
  --sidebar-active: rgba(29, 171, 137, 0.16);
  --text-primary: #ECF2FB; --text-secondary: #BFD0E7;
  --text-muted: #7A96B5; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #F3F6FB; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #EDF2FA; --hover: #E4ECF6;
  --accent: #17987A; --accent-hover: #128A6E;
  --accent-soft: rgba(23, 152, 122, 0.08);
  --secondary: #4A8A74; --sidebar: #E8EEF8;
  --text-primary: #102033; --text-secondary: #425B78;
  --text-muted: #7A96B5; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Nexus (Interna)

Accent: Gold `#D4AF37` | Secondary: Blue light `#AFD2FA`

### Dark
```css
:root {
  --background: #0F1629; --surface: #141C3A; --card: #192350;
  --elevated: #1E2A5C; --hover: #243268;
  --accent: #D4AF37; --accent-hover: #E0C050; --accent-dim: #B8962E;
  --accent-soft: rgba(212, 175, 55, 0.12); --accent-glow: rgba(212, 175, 55, 0.10);
  --accent-border: rgba(212, 175, 55, 0.30);
  --secondary: #AFD2FA; --secondary-soft: rgba(175, 210, 250, 0.10);
  --secondary-border: rgba(175, 210, 250, 0.15);
  --sidebar: #111A38; --sidebar-border: rgba(175, 210, 250, 0.08);
  --sidebar-active: rgba(212, 175, 55, 0.14);
  --text-primary: #F5F5F0; --text-secondary: #C8D0E0;
  --text-muted: #7A88A8; --text-on-accent: #0F1629;
}
```
### Light
```css
[data-theme='light'] {
  --background: #F5F5F0; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #EEEEE8; --hover: #E5E5DF;
  --accent: #B8962E; --accent-hover: #A08028;
  --accent-soft: rgba(184, 150, 46, 0.08);
  --secondary: #4A6890; --sidebar: #EAEAE4;
  --text-primary: #101828; --text-secondary: #4A5570;
  --text-muted: #8090A8; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Content Generator AI (Interna)

Accent: Coral `#E06848` | Secondary: Sage green `#5A9A78`

### Dark
```css
:root {
  --background: #110D0A; --surface: #181210; --card: #201A16;
  --elevated: #28221C; --hover: #302A24;
  --accent: #E06848; --accent-hover: #E87C60; --accent-dim: #C85A3C;
  --accent-soft: rgba(224, 104, 72, 0.12); --accent-glow: rgba(224, 104, 72, 0.10);
  --accent-border: rgba(224, 104, 72, 0.30);
  --secondary: #5A9A78; --secondary-soft: rgba(90, 154, 120, 0.10);
  --secondary-border: rgba(90, 154, 120, 0.18);
  --sidebar: #14100C; --sidebar-border: rgba(224, 104, 72, 0.10);
  --sidebar-active: rgba(224, 104, 72, 0.14);
  --text-primary: #F0EDE8; --text-secondary: #C8C0B8;
  --text-muted: #8A8078; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #FAF7F2; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #F4F0EA; --hover: #ECE8E0;
  --accent: #C85A3C; --accent-hover: #B84E32;
  --accent-soft: rgba(200, 90, 60, 0.08);
  --secondary: #3A7A58; --sidebar: #F0EBE4;
  --text-primary: #1A1410; --text-secondary: #5A4E44;
  --text-muted: #948880; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Impulso (Premium)

Accent: Naranja `#FF6A00` | Secondary: Naranja claro `#FFB366`

### Dark
```css
:root {
  --background: #0E0F18; --surface: #141520; --card: #1A1C2B;
  --elevated: #222435; --hover: #2A2D40;
  --accent: #FF6A00; --accent-hover: #FF8228; --accent-dim: #D45800;
  --accent-soft: rgba(255, 106, 0, 0.12); --accent-glow: rgba(255, 106, 0, 0.10);
  --accent-border: rgba(255, 106, 0, 0.30);
  --secondary: #FFB366; --secondary-soft: rgba(255, 179, 102, 0.10);
  --secondary-border: rgba(255, 179, 102, 0.18);
  --sidebar: #111220; --sidebar-border: rgba(255, 106, 0, 0.10);
  --sidebar-active: rgba(255, 106, 0, 0.14);
  --text-primary: #F0EEF5; --text-secondary: #B8B4C8;
  --text-muted: #7E7A90; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #F8F6FA; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #F2F0F5; --hover: #EAE8F0;
  --accent: #D45800; --accent-hover: #B84C00;
  --accent-soft: rgba(212, 88, 0, 0.08);
  --secondary: #A06020; --sidebar: #ECEAF2;
  --text-primary: #14151E; --text-secondary: #4A4860;
  --text-muted: #8884A0; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Data Lab (Premium)

Accent: Esmeralda `#2DA078` | Secondary: Esmeralda claro `#7ED4B8`

### Dark
```css
:root {
  --background: #061218; --surface: #0B1A22; --card: #10242E;
  --elevated: #162E38; --hover: #1C3842;
  --accent: #2DA078; --accent-hover: #38B88C; --accent-dim: #248A66;
  --accent-soft: rgba(45, 160, 120, 0.12); --accent-glow: rgba(45, 160, 120, 0.10);
  --accent-border: rgba(45, 160, 120, 0.30);
  --secondary: #7ED4B8; --secondary-soft: rgba(126, 212, 184, 0.10);
  --secondary-border: rgba(126, 212, 184, 0.18);
  --sidebar: #081820; --sidebar-border: rgba(45, 160, 120, 0.10);
  --sidebar-active: rgba(45, 160, 120, 0.14);
  --text-primary: #EBFBFF; --text-secondary: #B0D8E0;
  --text-muted: #6A9CA8; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #E9F7FB; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #E0F2F5; --hover: #D5ECF0;
  --accent: #248A66; --accent-hover: #1C7858;
  --accent-soft: rgba(36, 138, 102, 0.08);
  --secondary: #3A8A70; --sidebar: #DFF2F5;
  --text-primary: #09212A; --text-secondary: #2A5560;
  --text-muted: #6A9098; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Talent (Premium)

Accent: Azul cielo `#4A9FD8` | Secondary: Azul pálido `#A0D0F0`

### Dark
```css
:root {
  --background: #0C141E; --surface: #111C28; --card: #162535;
  --elevated: #1C2E40; --hover: #22384A;
  --accent: #4A9FD8; --accent-hover: #5CB4E8; --accent-dim: #3A88BE;
  --accent-soft: rgba(74, 159, 216, 0.12); --accent-glow: rgba(74, 159, 216, 0.10);
  --accent-border: rgba(74, 159, 216, 0.30);
  --secondary: #A0D0F0; --secondary-soft: rgba(160, 208, 240, 0.10);
  --secondary-border: rgba(160, 208, 240, 0.18);
  --sidebar: #0E1825; --sidebar-border: rgba(74, 159, 216, 0.10);
  --sidebar-active: rgba(74, 159, 216, 0.14);
  --text-primary: #EDF2F8; --text-secondary: #B0C4D8;
  --text-muted: #7090A8; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #F2F7FC; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #E8F0F8; --hover: #DEE8F4;
  --accent: #3A88BE; --accent-hover: #2E78A8;
  --accent-soft: rgba(58, 136, 190, 0.08);
  --secondary: #4878A0; --sidebar: #E4EDF5;
  --text-primary: #0C1820; --text-secondary: #3A5068;
  --text-muted: #7898B0; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Synergi (Premium)

Accent: Púrpura `#8C5AB4` | Secondary: Lavanda `#C4A0E0`

### Dark
```css
:root {
  --background: #0F0717; --surface: #160C22; --card: #1D0F2E;
  --elevated: #26163C; --hover: #2E1E48;
  --accent: #8C5AB4; --accent-hover: #A070CC; --accent-dim: #7648A0;
  --accent-soft: rgba(140, 90, 180, 0.12); --accent-glow: rgba(140, 90, 180, 0.10);
  --accent-border: rgba(140, 90, 180, 0.30);
  --secondary: #C4A0E0; --secondary-soft: rgba(196, 160, 224, 0.10);
  --secondary-border: rgba(196, 160, 224, 0.18);
  --sidebar: #120920; --sidebar-border: rgba(140, 90, 180, 0.10);
  --sidebar-active: rgba(140, 90, 180, 0.14);
  --text-primary: #F7EFFF; --text-secondary: #D0C0E0;
  --text-muted: #8A78A0; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #F7F2FC; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #F0E8F8; --hover: #E8DEF4;
  --accent: #7648A0; --accent-hover: #643A90;
  --accent-soft: rgba(118, 72, 160, 0.08);
  --secondary: #6A4890; --sidebar: #EDE4F5;
  --text-primary: #170923; --text-secondary: #4A3560;
  --text-muted: #8A78A0; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Command Center (Premium)

Accent: Rojo granate `#CC4455` | Secondary: Rosa pálido `#E89098`

### Dark
```css
:root {
  --background: #10080E; --surface: #18101A; --card: #201422;
  --elevated: #281C2A; --hover: #302434;
  --accent: #CC4455; --accent-hover: #DD5868; --accent-dim: #B03848;
  --accent-soft: rgba(204, 68, 85, 0.12); --accent-glow: rgba(204, 68, 85, 0.10);
  --accent-border: rgba(204, 68, 85, 0.30);
  --secondary: #E89098; --secondary-soft: rgba(232, 144, 152, 0.10);
  --secondary-border: rgba(232, 144, 152, 0.18);
  --sidebar: #140C14; --sidebar-border: rgba(204, 68, 85, 0.10);
  --sidebar-active: rgba(204, 68, 85, 0.14);
  --text-primary: #F5EEF0; --text-secondary: #C8B8C0;
  --text-muted: #908088; --text-on-accent: #FFFFFF;
}
```
### Light
```css
[data-theme='light'] {
  --background: #FAF5F6; --surface: #FFFFFF; --card: #FFFFFF;
  --elevated: #F5ECEE; --hover: #F0E4E6;
  --accent: #B03848; --accent-hover: #9C2E3C;
  --accent-soft: rgba(176, 56, 72, 0.08);
  --secondary: #904050; --sidebar: #F2E8EA;
  --text-primary: #1A1015; --text-secondary: #5A4048;
  --text-muted: #987880; --text-on-accent: #FFFFFF;
}
```

---

## Anclora Private Estates (Ultra Premium)

Accent: Gold `#D4AF37` | Secondary: Teal `#3AA090`

### Dark
```css
:root {
  --background: #07252F; --surface: #0B313F; --card: #0F3F45;
  --elevated: #124A50; --hover: #165A5C;
  --accent: #D4AF37; --accent-hover: #E6C96E; --accent-dim: #B8962E;
  --accent-soft: rgba(212, 175, 55, 0.12); --accent-glow: rgba(212, 175, 55, 0.15);
  --accent-border: rgba(212, 175, 55, 0.25);
  --accent-gradient: linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 50%, #FBF5B7 55%, #AA771C 100%);
  --secondary: #3AA090; --secondary-soft: rgba(58, 160, 144, 0.10);
  --secondary-border: rgba(58, 160, 144, 0.18);
  --sidebar: #07252F; --sidebar-border: rgba(212, 175, 55, 0.12);
  --sidebar-active: rgba(212, 175, 55, 0.16);
  --text-primary: #F5F5F0; --text-secondary: #C8D0CC;
  --text-muted: #7A8A85; --text-on-accent: #07252F;
}
```
### Light
```css
[data-theme='light'] {
  --background: #FBF9F4; --surface: #F4F0E8; --card: #FFFFFF;
  --elevated: #EBE5DB; --hover: #DDD4C7;
  --accent: #C9A95F; --accent-hover: #A8843E; --accent-dim: #D8BF86;
  --accent-soft: rgba(201, 169, 95, 0.10);
  --accent-border: rgba(201, 169, 95, 0.20);
  --secondary: #003331; --secondary-soft: rgba(0, 51, 49, 0.06);
  --sidebar: #F1ECE3; --sidebar-border: rgba(0, 51, 49, 0.08);
  --text-primary: #13211F; --text-secondary: #31423F;
  --text-muted: #64716E; --text-on-accent: #FFFFFF;
}
```
### Deep (secciones inmersivas)
```css
[data-section='deep'] {
  --background: #0D1B1A; --surface: #102423; --card: #14302F;
  --text-primary: #F7F4EE; --text-muted: rgba(247, 244, 238, 0.72);
}
```
