# AncloraBot Multiagente System

## Objetivo
Esta skill define cómo usar un sistema multiagente para documentar, revisar y coordinar trabajo del portal interno `Anclora Group`.

## Cuándo usarla

- Cuando haya que desglosar una iniciativa en subflujos de análisis, arquitectura, redacción y validación.
- Cuando una especificación requiera coherencia entre visión, core spec, feature spec y test plan.
- Cuando se necesite una lectura de producto con varias perspectivas coordinadas.

## Contexto del dominio

`Anclora Group` es el portal interno corporativo del ecosistema Anclora. Su función es centralizar accesos, launcher de aplicaciones internas, control por rol y separación entre herramientas internas y experiencias públicas.

## Roles sugeridos

- `orchestrator`: coordina el flujo y consolida decisiones.
- `product-analyst`: traduce necesidades de negocio a alcance.
- `architect`: valida estructura, dependencias y separación de capas.
- `spec-writer`: redacta documentos claros y trazables.
- `qa-planner`: deriva criterios de prueba y cobertura.

## Flujo recomendado

1. Confirmar objetivo, alcance y versión.
1. Leer la arquitectura fuente y las especificaciones existentes.
1. Dividir el trabajo entre análisis, redacción y verificación.
1. Consolidar decisiones en un único documento de referencia.
1. Actualizar test plan y trazabilidad.

## Entregables esperados

- `sdd/core/product-spec-v0.md`
- `sdd/core/spec-core-v1.md`
- `sdd/features/<feature-id>/<feature-id>-spec-v1.md`
- `sdd/features/<feature-id>/test-plan.md`

## Reglas operativas

- No mezclar alcance público con portal interno.
- No introducir dependencias de UI en documentos de gobernanza.
- No asumir permisos implícitos sin documentarlos.
- No cerrar una feature sin cobertura mínima de pruebas.

## Checklist de validación

- El nombre del producto es consistente en todos los docs.
- El alcance v1 está acotado y no se desborda.
- Los roles están definidos y enlazados a capacidades.
- El test plan cubre happy path, permisos, errores y regresión.

