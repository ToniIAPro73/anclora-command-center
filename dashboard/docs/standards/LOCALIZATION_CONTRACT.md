# Localization Contract

## Objetivo
Garantizar que cada aplicación del ecosistema respete su cobertura real de idiomas y que ninguna feature nueva introduzca mezcla de idioma, deuda de traducción o layouts rotos por expansión de copy.

## Regla base
- El contrato de localización se adapta al número de idiomas objetivo de cada app, no a la cantidad de locales que pueda haber en helpers internos.

Cobertura objetivo por aplicación:
- `anclora-group`: `es`, `en`
- `anclora-advisor-ai`: `es`, `en`
- `anclora-nexus`: `es`, `en`, `de`, `ru`
- `anclora-content-generator-ai`: `es`, `en`
- `anclora-impulso`: `es`, `en`
- `anclora-command-center`: `es`, `en`, `de`
- `anclora-synergi`: `es`, `en`, `de`
- `anclora-data-lab`: `es`, `en`, `de`
- `anclora-private-estates`: `es`, `en`, `de`, `fr`

## Reglas obligatorias
- No mezclar idiomas en una misma vista salvo contenido de terceros o nombres propios.
- Todo texto visible de producto debe nacer en la capa de traducción aprobada por el repo.
- No cerrar una feature con copy sólo en el idioma por defecto.
- El idioma visible al usuario debe poder trazarse a:
  - selector visible
  - preferencia persistida
  - o fallback explícito documentado
- Las pantallas deben soportar expansión de copy sin desbordes, truncados peligrosos ni CTAs rotos.

## Reglas de implementación
- No hardcodear labels, placeholders, estados, validaciones ni títulos de modal si la app soporta más de un idioma.
- Las claves deben agruparse por dominio y no crecer como lista plana sin criterio.
- El fallback de una clave ausente no puede quedar silenciosamente en otro idioma sin detectarse en QA.
- Todo selector de idioma debe actualizar:
  - `lang`
  - estado visual del toggle
  - persistencia local o equivalente

## Reglas de layout
- No resolver diferencias de longitud con truncado agresivo como solución principal.
- Permitir wraps controlados en:
  - tabs
  - botones secundarios largos
  - headings
  - labels de filtros
- Si un idioma rompe la composición, se corrige la composición, no se sacrifica la traducción.

## Excepciones permitidas
- marca
- nombres propios
- términos legales o de terceros cuando no tenga sentido traducirlos
- datos del usuario o payloads externos

## Gate de aceptación

Una feature no está lista si:
- deja textos nuevos fuera de i18n
- la vista mezcla idiomas
- el selector de idioma existe pero no gobierna toda la superficie afectada
- una traducción rompe layout y se ignora como “caso raro”
