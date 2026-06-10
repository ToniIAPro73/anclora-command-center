# Plantilla de Plan Técnico – Dashboard Real Estate

> **Uso**: se recomienda copiar esta plantilla en el repo de código donde viva la lógica principal (por ejemplo, `anclora-command-center`).

## 1. Resumen

- **ID**: `REAL-<TOPICO>-<NNN>`.
- **Spec**: ruta a la spec correspondiente.
- Breve descripción técnica de la mejora de dashboard.

## 2. Contexto técnico

- Repos afectados (`anclora-command-center`, otras apps).
- Módulos/paths involucrados (queries, componentes de UI, endpoints de agregación, etc.).

## 3. Arquitectura propuesta

- Diagramas lógicos de cómo se obtienen, transforman y exponen los datos.
- Origen de los datos y relación con `anclora-group-real-estate-dataset.xlsx`.

## 4. Cambios en modelo de datos

- Nuevos campos, agregaciones o tablas auxiliares.
- Reglas de refresco (frecuencia de actualización, ventanas temporales).

## 5. Flujos principales

- Flujos de consulta y renderizado de los paneles afectados.
- Flujos entre apps (ADL→ANX, ACG→ANX, etc.) que se reflejan en el dashboard.

## 6. Estrategia de tests

- Tests automatizados para queries/agregaciones.
- Tests de UI (snapshots, interacciones básicas).

## 7. Riesgos técnicos

- Riesgos de rendimiento (consultas pesadas, timeouts).
- Riesgos de consistencia (datos parcialmente actualizados, fuentes con latencias distintas).

## 8. Observabilidad

- Logs, métricas y alertas específicas para esta feature de dashboard.
