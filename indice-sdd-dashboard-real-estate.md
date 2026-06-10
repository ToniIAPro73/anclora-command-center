# Índice SDD – Dashboard Real Estate

## 1. Propósito

Este índice conecta el **Dashboard Real Estate** de la bóveda con las especificaciones SDD y los repositorios de código que lo implementan.

- Fuente de verdad del dataset: `output/spreadsheet/anclora-group-real-estate-dataset.xlsx` (snapshot 2026-03-31).
- Fuente de verdad de visualización y operaciones: repo `anclora-command-center` (panel y backend del cuadro de mando).
- Esta nota sirve como punto de entrada para localizar specs, planes, tasks y contratos relacionados con cada app, interacción, campo y fuente.

## 2. Relación bóveda ↔ código

- Bóveda (esta carpeta `resources/dashboard-real-estate/`):
  - Define la taxonomía de **apps**, **interacciones**, **campos** y **fuentes**.
  - Mantiene el índice canónico (`indice-dashboard-real-estate.md`).
- Código (repo `anclora-command-center`):
  - Implementa el cuadro de mando, queries y visualizaciones.
  - Consume los contratos y definiciones de esta carpeta.

## 3. Apps Real Estate

Apps cubiertas por este dashboard:

- APE – Anclora Private Estates.
- ADL – Anclora Data Lab.
- AES – Anclora EnergyScan.
- ASY – Anclora Synergi.
- ANX – Anclora Nexus.
- ACG – Anclora Content Generator AI.

Para cada app se recomienda mantener specs/planes/tasks en su repo principal, referenciando este índice cuando la feature afecte al dashboard.

## 4. Convenciones de IDs de feature

Para features que impactan el vertical inmobiliario y/o el Dashboard Real Estate:

- Formato de ID: `REAL-<TOPICO>-<NNN>` (ejemplo `REAL-OTP-001`, `REAL-LEADS-002`).
- Estos IDs deben aparecer en:
  - Nombre de spec: `spec-REAL-<TOPICO>-<NNN>.md`.
  - Nombre de plan: `plan-REAL-<TOPICO>-<NNN>.md`.
  - Nombre de tasks: `tasks-REAL-<TOPICO>-<NNN>.md`.

## 5. Enlaces relevantes

- Índice original de Dashboard Real Estate: `resources/dashboard-real-estate/indice-dashboard-real-estate.md`.
- Repo de implementación del cuadro de mando: `https://github.com/ToniIAPro73/anclora-command-center`.
