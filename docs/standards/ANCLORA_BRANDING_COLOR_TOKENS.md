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

Definir los tokens CSS de color para cada aplicación del ecosistema. Cada app utiliza tokens compartidos de su grupo más tokens individuales derivados de su color de acento.

## Estructura de tokens

Cada app define estos grupos de tokens:

| Grupo | Tokens | Origen |
|-------|--------|--------|
| Surfaces | `--background`, `--surface`, `--card`, `--elevated`, `--hover` | Individual |
| Accent | `--accent`, `--accent-hover`, `--accent-dim`, `--accent-soft`, `--accent-glow`, `--accent-border` | Individual |
| Secondary | `--secondary`, `--secondary-soft`, `--secondary-border` | Individual |
| Sidebar | `--sidebar`, `--sidebar-border`, `--sidebar-active` | Individual |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-accent` | Compartido por grupo |
| Semántico | `--danger`, `--success`, `--warning` y variantes `-soft` | Compartido global |
| Estructura | `--radius-*`, `--shadow-*`, `--border-*` | Compartido global |

## Tokens compartidos globales

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-full: 9999px;
--border-subtle: rgba(255, 255, 255, 0.08);
--border-default: rgba(255, 255, 255, 0.12);
--border-strong: rgba(255, 255, 255, 0.20);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.20);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.28);
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.36);

--danger: #E53E3E;
--danger-soft: rgba(229, 62, 62, 0.12);
--success: #38A169;
--success-soft: rgba(56, 161, 105, 0.12);
--warning: #D69E2E;
--warning-soft: rgba(214, 158, 46, 0.12);
```

## Anclora Group · entidad única

Accent: silver `#A8AEB8` · tipografía: `Georgia, serif`

### Dark

```css
:root {
  --background: #0F1520;
  --surface: #151C28;
  --card: #1A2230;
  --elevated: #202A38;
  --hover: #263040;
  --accent: #A8AEB8;
  --accent-hover: #BCC2CC;
  --accent-dim: #8A909A;
  --accent-soft: rgba(168, 174, 184, 0.12);
  --accent-glow: rgba(168, 174, 184, 0.08);
  --accent-border: rgba(168, 174, 184, 0.25);
  --sidebar: #111925;
  --sidebar-border: rgba(168, 174, 184, 0.10);
  --sidebar-active: rgba(168, 174, 184, 0.14);
  --text-primary: #ECF0F5;
  --text-secondary: #B0BEC5;
  --text-muted: #728694;
  --text-on-accent: #0F1520;
}
```

### Light

```css
[data-theme='light'] {
  --background: #F4F6F8;
  --surface: #FFFFFF;
  --card: #FFFFFF;
  --elevated: #F0F2F5;
  --hover: #E8ECF0;
  --accent: #5C6370;
  --accent-hover: #4A5060;
  --accent-soft: rgba(92, 99, 112, 0.08);
  --accent-border: rgba(92, 99, 112, 0.20);
  --sidebar: #EAEDF2;
  --sidebar-border: rgba(0, 0, 0, 0.08);
  --text-primary: #101820;
  --text-secondary: #4A5568;
  --text-muted: #8492A6;
  --text-on-accent: #FFFFFF;
}
```

## Anclora Advisor AI · interna

Accent: teal `#1DAB89` · secondary: mint `#A1DBC6`

### Dark

```css
:root {
  --background: #101E30;
  --surface: #152438;
  --card: #1A2C42;
  --elevated: #20344C;
  --hover: #263C56;
  --accent: #1DAB89;
  --accent-hover: #22C49E;
  --accent-dim: #17987A;
  --accent-soft: rgba(29, 171, 137, 0.12);
  --accent-glow: rgba(29, 171, 137, 0.10);
  --accent-border: rgba(29, 171, 137, 0.30);
  --secondary: #A1DBC6;
  --secondary-soft: rgba(161, 219, 198, 0.10);
  --secondary-border: rgba(161, 219, 198, 0.18);
  --sidebar: #132133;
  --sidebar-border: rgba(161, 219, 198, 0.12);
  --sidebar-active: rgba(29, 171, 137, 0.16);
  --text-primary: #ECF2FB;
  --text-secondary: #BFD0E7;
  --text-muted: #7A96B5;
  --text-on-accent: #FFFFFF;
}
```

### Light

```css
[data-theme='light'] {
  --background: #F3F6FB;
  --surface: #FFFFFF;
  --card: #FFFFFF;
  --elevated: #EDF2FA;
  --hover: #E4ECF6;
  --accent: #17987A;
  --accent-hover: #128A6E;
  --accent-soft: rgba(23, 152, 122, 0.08);
  --accent-border: rgba(23, 152, 122, 0.20);
  --secondary: #4A8A74;
  --secondary-soft: rgba(74, 138, 116, 0.06);
  --sidebar: #E8EEF8;
  --sidebar-border: rgba(22, 41, 68, 0.10);
  --text-primary: #102033;
  --text-secondary: #425B78;
  --text-muted: #7A96B5;
  --text-on-accent: #FFFFFF;
}
```

## Anclora Nexus · interna

Accent: gold `#D4AF37` · secondary: blue light `#AFD2FA`

### Dark

```css
:root {
  --background: #0F1629;
  --surface: #141C3A;
  --card: #192350;
  --elevated: #1E2A5C;
  --hover: #243268;
  --accent: #D4AF37;
  --accent-hover: #E0C050;
  --accent-dim: #B8962E;
  --accent-soft: rgba(212, 175, 55, 0.12);
  --accent-glow: rgba(212, 175, 55, 0.10);
  --accent-border: rgba(212, 175, 55, 0.30);
  --secondary: #AFD2FA;
  --secondary-soft: rgba(175, 210, 250, 0.10);
  --secondary-border: rgba(175, 210, 250, 0.15);
  --sidebar: #111A38;
  --sidebar-border: rgba(175, 210, 250, 0.08);
  --sidebar-active: rgba(212, 175, 55, 0.14);
  --text-primary: #F5F5F0;
  --text-secondary: #C8D0E0;
  --text-muted: #7A88A8;
  --text-on-accent: #0F1629;
}
```

### Light

```css
[data-theme='light'] {
  --background: #F5F5F0;
  --surface: #FFFFFF;
  --card: #FFFFFF;
  --elevated: #EEEEE8;
  --hover: #E5E5DF;
  --accent: #B8962E;
  --accent-hover: #A08028;
  --accent-soft: rgba(184, 150, 46, 0.08);
  --accent-border: rgba(184, 150, 46, 0.22);
  --secondary: #4A6890;
  --secondary-soft: rgba(74, 104, 144, 0.06);
  --sidebar: #EAEAE4;
  --sidebar-border: rgba(25, 35, 80, 0.08);
  --text-primary: #101828;
  --text-secondary: #4A5570;
  --text-muted: #8090A8;
  --text-on-accent: #FFFFFF;
}
```

## Anclora Content Generator AI · interna

Accent: coral `#E06848` · secondary: sage green `#5A9A78`

### Dark

```css
:root {
  --background: #110D0A;
  --surface: #181210;
  --card: #201A16;
  --elevated: #28221C;
  --hover: #302A24;
  --accent: #E06848;
  --accent-hover: #E87C60;
  --accent-dim: #C85A3C;
  --accent-soft: rgba(224, 104, 72, 0.12);
  --accent-glow: rgba(224, 104, 72, 0.10);
  --accent-border: rgba(224, 104, 72, 0.30);
  --secondary: #5A9A78;
  --secondary-soft: rgba(90, 154, 120, 0.10);
  --secondary-border: rgba(90, 154, 120, 0.18);
  --sidebar: #14100C;
  --sidebar-border: rgba(224, 104, 72, 0.10);
  --sidebar-active: rgba(224, 104, 72, 0.14);
  --text-primary: #F0EDE8;
  --text-secondary: #C8C0B8;
  --text-muted: #8A8078;
  --text-on-accent: #FFFFFF;
}
```

### Light

```css
[data-theme='light'] {
  --background: #FAF7F2;
  --surface: #FFFFFF;
  --card: #FFFFFF;
  --elevated: #F4F0EA;
  --hover: #ECE8E0;
  --accent: #C85A3C;
  --accent-hover: #B84E32;
  --accent-soft: rgba(200, 90, 60, 0.08);
  --accent-border: rgba(200, 90, 60, 0.20);
  --secondary: #3A7A58;
  --secondary-soft: rgba(58, 122, 88, 0.06);
  --sidebar: #F0EBE4;
  --sidebar-border: rgba(26, 20, 16, 0.08);
  --text-primary: #1A1410;
  --text-secondary: #5A4E44;
  --text-muted: #948880;
  --text-on-accent: #FFFFFF;
}
```

## Apps premium y ultra premium

Los tokens para apps premium y ultra premium quedan definidos como siguiente capa de trabajo. Los colores de acento ya están asignados en [[ANCLORA_BRANDING_ICON_SYSTEM]].

| App | Accent | Secondary propuesta |
|-----|--------|----------------------|
| `anclora-impulso` | `#FF6A00` naranja | `#FFB366` naranja claro |
| `anclora-data-lab` | `#2DA078` esmeralda | `#7ED4B8` esmeralda claro |
| `anclora-talent` | `#4A9FD8` azul cielo | `#A0D0F0` azul pálido |
| `anclora-synergi` | `#8C5AB4` púrpura | `#C4A0E0` lavanda |
| `anclora-command-center` | `#CC4455` rojo granate | `#E89098` rosa pálido |
| `anclora-private-estates` | `#D4AF37` oro | `#AFD2FA` teal/blue |
