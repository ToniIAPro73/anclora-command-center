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
- `docs/cambios/CONTRACT_CHANGE_QUEUE.md`
- `docs/cambios/CONTRACT_CHANGE_HISTORY.md`

## Orden de lectura

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/governance/CONTRACT_HIERARCHY.md`
3. `docs/governance/APPLICATION_FAMILY_MAP.md`
4. `docs/governance/CONTRACT_CONDITION_CATALOG.md`
5. contrato del grupo aplicable
6. `docs/standards/UI_MOTION_CONTRACT.md`
7. `docs/standards/MODAL_CONTRACT.md`
8. `docs/standards/LOCALIZATION_CONTRACT.md`

## Flujo de cambios

1. registrar cambios contractuales en `docs/cambios/CONTRACT_CHANGE_QUEUE.md`
2. actualizar primero la bóveda
3. propagar después a repos afectados
4. actualizar `docs/governance/CONTRACT_COMPLIANCE_MATRIX.md`
5. mover el cambio a histórico cuando quede cerrado

## Scripts operativos

- `scripts/propagate-contracts.ps1`
- `scripts/audit-contract-sync.ps1`
- `scripts/close-contract-change.ps1`

## Nota

El dashboard de la bóveda tiene su propio set aplicado en `dashboard/docs/standards/` por pertenecer al grupo premium.
