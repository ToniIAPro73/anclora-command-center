# Plantilla de Spec – Feature Dashboard Real Estate

> **Uso**: se recomienda copiar esta plantilla en el repo de código que implemente la feature (por ejemplo, `anclora-command-center`, `anclora-data-lab`, `anclora-nexus`, etc.). Esta copia en la bóveda sirve como referencia.

## 1. Metadatos

- **ID**: `REAL-<TOPICO>-<NNN>` (p.ej. `REAL-LEADS-001`).
- **Producto / App**: (APE / ADL / AES / ASY / ANX / ACG / Anclora Command Center).
- **Vertical**: Real Estate.
- **Estado**: Draft / In Review / Approved / Implemented.
- **Fecha**: YYYY-MM-DD.

## 2. Outcomes (Resultados esperados)

Describe qué mejora aporta esta feature al Dashboard Real Estate o a las apps conectadas (mayor claridad, nuevas métricas, mejor trazabilidad de flujos, etc.).

## 3. Scope Boundaries (Límites de alcance)

- **Dentro de alcance**:
  - Métricas, paneles o filtros que se van a crear/modificar.
  - Campos del dataset afectados.
  - Interacciones entre apps que se verán reflejadas.
- **Fuera de alcance**:
  - Cambios en contratos de negocio no relacionados con el dashboard.
  - Refactors tecnológicos que no cambien la semántica de los datos.

## 4. Functional Requirements (EARS)

Redacta requisitos usando sintaxis EARS:

- **REQ-X (Activado por Evento)**: CUANDO `<evento>` EL sistema DEBERÁ `<comportamiento>`.
- **REQ-Y (Estado No Deseado)**: SI `<condición de error>` EL sistema DEBERÁ `<mitigación>`.
- **REQ-Z (Impulsado por el Estado)**: MIENTRAS `<estado>` EL sistema DEBERÁ `<comportamiento>`.
- **REQ-U (Ubicuo)**: El sistema DEBERÁ `<política global del dashboard>`.

## 5. Security & Performance Constraints

- Requisitos de rendimiento del dashboard (tiempos de carga máximos, frecuentes filtros, etc.).
- Requisitos de seguridad y privacidad (visibilidad de datos sensibles por rol, filtrado geográfico, etc.).

## 6. Data Model

- Campos del dataset Real Estate afectados (referenciar nombres de campo canónicos).
- Nuevas columnas o agregaciones calculadas.

## 7. Verification Criteria

- Casos de prueba para validar que los números del dashboard coinciden con la fuente de verdad (`anclora-group-real-estate-dataset.xlsx`).
- Escenarios de regresión (ejemplos de cambios que no deberían afectar a métricas existentes).

## 8. Impacto en Apps

- Apps afectadas (APE, ADL, AES, ANX, ASY, ACG, Command Center).
- Flujos de usuario que cambian en cada app, si aplica.
