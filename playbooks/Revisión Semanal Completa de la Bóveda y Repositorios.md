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
2. Revisa la nota diaria generada o actualizada para hoy.
3. Confirma si la sesión incluye también auditoría GitHub completa.

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

1. Escanear notas en `proyectos/` y `research/anclora/` con propiedad `repo`.
2. Validar:
   - accesibilidad de URL
   - fecha del último commit
   - cambios relevantes en README
   - autores recientes no registrados en `personas/`
3. Marcar:
   - `#stale-repo` si no hubo actividad en 14 días
   - `#update-readme-sync` si README cambió y la nota no refleja ese cambio
4. Actualizar la nota diaria con el bloque `## 🐙 Estado Semanal de Repositorios`.

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
