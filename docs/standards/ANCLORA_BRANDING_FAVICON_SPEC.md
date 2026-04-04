---
title: ANCLORA_BRANDING_FAVICON_SPEC
type: standard
estado: activo
scope: branding
tags: [branding, standards, anclora, favicon]
related:
  - "[[ANCLORA_BRANDING_MASTER_CONTRACT]]"
  - "[[ANCLORA_BRANDING_ICON_SYSTEM]]"
---

# ANCLORA_BRANDING_FAVICON_SPEC

> Referencia: [[ANCLORA_BRANDING_MASTER_CONTRACT]]

## Objetivo

Definir el paquete de favicons que cada aplicación del ecosistema debe generar e implementar. Garantizar reconocimiento y diferenciación a todos los tamaños.

## Paquete obligatorio por app

| Archivo | Formato | Tamaño | Uso |
|---------|---------|--------|-----|
| `favicon.ico` | ICO multi-resolución | `16, 32, 48, 64, 128, 256 px` | fallback universal |
| `favicon-32.png` | PNG RGBA | `32x32 px` | pestaña de navegador |
| `favicon-512.png` | PNG RGBA | `512x512 px` | PWA manifest, social sharing |
| `apple-touch-icon.png` | PNG RGBA | `180x180 px` | iOS home screen |

## Proceso de generación

1. Partir del icono canónico de la app, `1024x1024`, fondo transparente.
2. Detectar el círculo del icono, excluyendo fondo negro si lo hay.
3. Aplicar máscara circular con antialiasing.
4. Recortar al bounding box del círculo con `5px` de padding.
5. Redimensionar a cada tamaño objetivo usando `LANCZOS`.
6. Generar el `.ico` con todos los tamaños embebidos.

## Implementación HTML

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

## Implementación por framework

### Next.js · App Router

Colocar directamente en `app/`:

```text
app/
├── favicon.ico
├── icon.png
├── apple-icon.png
```

### Next.js · Pages Router

Colocar en `public/` y añadir manualmente en `pages/_document.tsx`.

### Vite · CRA · Nuxt · SvelteKit · Astro · Angular

Colocar en `public/` o `static/` y referenciar en `index.html` o la configuración del framework.

## PWA manifest

```json
{
  "name": "[Nombre de la app]",
  "short_name": "[Nombre corto]",
  "icons": [
    {
      "src": "/favicon-32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/favicon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Nomenclatura de archivos fuente

| App | Prefijo | Ejemplo |
|-----|---------|---------|
| `anclora-group` | `group_` | `group_favicon.ico` |
| `anclora-advisor-ai` | `advisor_` | `advisor_favicon.ico` |
| `anclora-nexus` | `nexus_` | `nexus_favicon.ico` |
| `anclora-content-generator-ai` | `contentgen_` | `contentgen_favicon.ico` |
| `anclora-impulso` | `impulso_` | `impulso_favicon.ico` |
| `anclora-data-lab` | `datalab_` | `datalab_favicon.ico` |
| `anclora-talent` | `talent_` | `talent_favicon.ico` |
| `anclora-synergi` | `synergi_` | `synergi_favicon.ico` |
| `anclora-command-center` | `commandcenter_` | `commandcenter_favicon.ico` |
| `anclora-private-estates` | `pe_` | `pe_favicon.ico` |

## Validación de diferenciación a `32px`

1. El color del borde identifica el grupo.
2. El color dominante del interior es distinguible del de las otras apps del mismo grupo.
3. Las ondas aportan un destello del color de acento.

## Criterio de cumplimiento

Una app no cumple esta spec si:
- falta alguno de los 4 archivos del paquete
- el favicon no corresponde al icono canónico actual de la app
- el fondo no es transparente
- el `.ico` no contiene las resoluciones requeridas
