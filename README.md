# Boveda Anclora

Bóveda operativa y documental del ecosistema Anclora.

## Función

- concentrar documentación estratégica y operativa
- alojar la copia maestra de contratos UX/UI de ecosistema
- servir de referencia al crear o modificar aplicaciones del grupo

## Ruta contractual maestra

- `docs/standards/`

## Gobierno contractual

- `docs/governance/CONTRACT_HIERARCHY.md`
- `docs/governance/CONTRACT_CONDITION_CATALOG.md`
- `docs/governance/APPLICATION_FAMILY_MAP.md`
- `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
- `docs/governance/CONTRACT_ACTION_PLAN.md`
- `docs/cambios/CONTRACT_CHANGE_QUEUE.md`
- `docs/cambios/CONTRACT_CHANGE_HISTORY.md`

## Orden de lectura

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/governance/CONTRACT_HIERARCHY.md`
3. `docs/governance/APPLICATION_FAMILY_MAP.md`
4. `docs/governance/CONTRACT_CONDITION_CATALOG.md`
5. `docs/governance/CONTRACT_ACTION_PLAN.md`
6. contrato del grupo aplicable
7. `docs/standards/UI_MOTION_CONTRACT.md`
8. `docs/standards/MODAL_CONTRACT.md`
9. `docs/standards/LOCALIZATION_CONTRACT.md`

## Flujo de cambios

1. registrar cambios contractuales en `docs/cambios/CONTRACT_CHANGE_QUEUE.md`
2. generar o enlazar el plan de accion y dejar el cambio en `ANALYSIS_REQUIRED` o `PLAN_READY`
3. aprobar, rechazar o marcar como `APP_ONLY`
4. actualizar primero la bóveda
5. propagar despues a repos afectados solo si la decision es `APPROVED`
6. actualizar `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
7. regenerar `docs/governance/CONTRACT_ACTION_PLAN.md`
8. mover el cambio a histórico cuando quede cerrado

## Scripts operativos

- `scripts/propagate-contracts.ps1`
- `scripts/audit-contract-sync.ps1`
- `scripts/close-contract-change.ps1`
- `scripts/process-contract-change-queue.ps1`
- `scripts/generate-contract-action-plan.ps1`

## Nota

El dashboard de la bóveda tiene su propio set aplicado en `dashboard/docs/standards/` por pertenecer al grupo premium.
