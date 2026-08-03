<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-command-center.png" alt="Anclora Command Center" width="132" />

# Anclora Command Center

### Dashboard operativo interno del ecosistema Anclora

Panel de control central que sincroniza datos de la Bóveda y ofrece una vista consolidada del estado del ecosistema Anclora.

**Español** · [English](./README.en.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoría](https://img.shields.io/badge/categoría-Premium-6C63FF)
![Idiomas](https://img.shields.io/badge/idiomas-ES%20%7C%20EN-047857)

</div>

---

> [!IMPORTANT]
> Repositorio interno del ecosistema Anclora, alojado dentro de la Bóveda (`dashboard/`). No publicar detalles operativos, credenciales ni lógica sensible fuera de canales autorizados.

## Qué es

Anclora Command Center es el dashboard operativo interno del ecosistema: sincroniza datos y documentación desde la Bóveda y los presenta en un panel visual centralizado para seguimiento del estado de proyectos, contratos y gobernanza.

## Categoría en el ecosistema

| Campo | Valor |
|---|---|
| Categoría | Premium |
| Acento de marca | `#6C63FF` |
| Repositorio canónico | `anclora-command-center` |
| Ubicación | `dashboard/` dentro de la Bóveda Anclora |

## Funcionalidades principales

- Sincronización automática de datos desde la Bóveda (`chokidar`, `gray-matter`)
- Panel visual de estado del ecosistema
- Exportación e importación de datos (ExcelJS)

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Vite, React |
| Sincronización | Chokidar (watch de ficheros), gray-matter (frontmatter) |
| Datos | ExcelJS |

## Arranque local

```bash
npm install
npm run dev
```

## Idiomas soportados

- Español (predeterminado)
- English

## Documentación y gobernanza

- Bóveda Anclora (fuente de verdad): `contracts/` y `docs/governance/`, en la raíz de este mismo repositorio

---

<div align="center">

### Anclora Group

Uso interno.

</div>
