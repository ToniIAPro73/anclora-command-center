---
title: Revisión Semanal Completa de la Bóveda y Repositorios
objetivo: Ejecutar una revisión semanal integral de Obsidian y de los repositorios vinculados con baja fricción operativa.
ambito: personal y profesional
frecuencia: semanal
estado: activo
herramientas: [obsidian, github, codex, vault-gardener, note-crafter]
tags: [playbook]
related:
  - "[[Revisión Semanal del Segundo Cerebro]]"
  - "[[Comandos Rápidos Codex]]"
  - "[[Mapa del Sistema de Agentes]]"
  - "[[MOC de Negocio]]"
---

# Revisión Semanal Completa de la Bóveda y Repositorios

## 🎯 Objetivo

Mantener bajo control la entropía del segundo cerebro y asegurar la coherencia entre la documentación en Obsidian y el estado real de los repositorios vinculados.

## 🧭 Cuándo usarlo

- Todos los viernes a las 15:00
- O cuando se acumulen cambios relevantes en proyectos, research o repositorios

## ✅ Precondiciones

- Tener Codex disponible sobre el repo
- Tener acceso a internet para contrastar GitHub cuando haga falta
- Haber usado la bóveda durante la semana o tener actividad reciente que revisar

## 🪜 Flujo recomendado

### Fase 1. Preparación

1. Ejecuta `.\scripts\start-weekly-review.ps1`.
2. Revisa el brief generado en la nota diaria.
3. Valida alertas `DOC_SYNC`, `DESIGN_SYSTEM_SYNC`, `CONTRACT_SYNC` o `INVESTIGATE`.
4. Confirma si la sesión incluye también auditoría GitHub completa.

### Fase 2. Bóveda

1. Sincronizar skills:
   - `powershell -ExecutionPolicy Bypass -File .\scripts\sync-skills.ps1`
2. Ejecutar jardinería de bóveda:
   - revisar enlaces rotos
   - detectar notas huérfanas
   - listar tags duplicados
3. Procesar `inbox/` según regla de promoción.
4. Revisar proyectos, personas y notas de research activas.
5. Actualizar la nota diaria con el bloque `## 🧹 Mantenimiento de Bóveda`.

### Fase 3. Repositorios

1. El inventario canónico vive en `docs/governance/ecosystem-repos.json`.
2. Los repos del ecosistema se auditan desde WSL mediante `scan-ecosystem-repos.ps1`.
3. `anclora-design-system` se trata como infraestructura de diseño compartida, no como una app más.
4. Revisa el bloque `## 🐙 Estado Semanal de Repositorios` y confirma:
   - accesibilidad real o acceso limitado
   - actividad reciente
   - alertas candidatas a documentación, contratos o design system
5. Solo después decide si el cambio es `APP_ONLY` o requiere sincronización con la bóveda.

### Fase 4. Consolidación

1. Extraer decisiones y hitos de la semana.
2. Promover lo importante a `resources/`, `playbooks/` o `sistemas/`.
3. Verificar que `Anclora Group` y `MOC de Negocio` reflejan cambios relevantes del ecosistema.

## 🔎 Checklist fija

- [ ] Skills sincronizadas
- [ ] `inbox/` revisado
- [ ] Notas huérfanas revisadas
- [ ] Proyectos revisados
- [ ] Personas nuevas detectadas o confirmadas
- [ ] Repositorios con `repo` auditados
- [ ] README remotos relevantes contrastados
- [ ] Nota diaria actualizada con ambos bloques de reporte
- [ ] MOCs principales revisados

## ⚠️ Riesgos y rollback

- Riesgo principal: convertir la revisión semanal en una tarea demasiado pesada
- Corrección: hacer siempre la fase de bóveda y dejar la auditoría GitHub en modo ligero si la semana fue tranquila

## 🔗 Relacionado

- [[Revisión Semanal del Segundo Cerebro]]
- [[Rutina Diaria del Segundo Cerebro]]
- [[Comandos Rápidos Codex]]
- [[MOC de Negocio]]
- [[Anclora Group]]

#playbook
