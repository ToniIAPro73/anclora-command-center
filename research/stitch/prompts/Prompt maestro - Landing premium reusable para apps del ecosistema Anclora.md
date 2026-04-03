---
title: Prompt maestro - Landing premium reusable para apps del ecosistema Anclora
type: recurso
estado: activo
scope: prompts-ux-premium
tags: [anclora, prompt, landing, premium, design-system, reusable]
related:
  - "[[Azure Bay - Caso de estudio de landing premium]]"
  - "[[Anclora Portfolio - Base técnica reutilizable]]"
  - "[[Anclora Talent]]"
  - "[[ANCLORA_PREMIUM_APP_CONTRACT]]"
  - "[[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]]"
  - "[[UI_MOTION_CONTRACT]]"
---

# Prompt maestro - Landing premium reusable para apps del ecosistema Anclora

Este recurso reúne los prompts base para generar un prototipo de landing page premium que pueda reutilizarse como punto de partida para cualquier aplicación actual o futura del ecosistema Anclora.

La intención no es producir una landing genérica, sino una estructura madre coherente con la gramática premium del grupo y adaptable después a productos editoriales, AI, data, servicios o plataformas operativas.

## Cuándo usarlo

- cuando haya que explorar una nueva landing de producto dentro del ecosistema
- cuando se quiera generar una base visual reusable antes de personalizar una app concreta
- cuando se necesite mantener coherencia con [[ANCLORA_PREMIUM_APP_CONTRACT]] y [[UI_MOTION_CONTRACT]]

## Principios de referencia

- El primer viewport debe explicar rápido qué es el producto y cuál es la siguiente acción.
- Solo debe existir un CTA dominante por viewport principal.
- La landing debe sentirse premium, editorial y deliberada.
- No debe parecer un dashboard interno con decoración aplicada encima.
- El motion debe ser refinado, breve y sobrio.
- La arquitectura debe servir como sistema reusable para varias apps del grupo.

## Prompt plantilla con variables

```text
Actúa como director creativo, diseñador de producto premium y experto en landing pages de alta conversión para el ecosistema Anclora Group.

Tu tarea es diseñar el prototipo estructural de una landing page premium para la aplicación/proyecto:

- Nombre: {{NOMBRE_APP}}
- Categoría: {{TIPO_APP}}
- Público principal: {{PUBLICO_OBJETIVO}}
- Objetivo principal de conversión: {{OBJETIVO_CONVERSION}}
- Propuesta de valor: {{PROPUESTA_VALOR}}
- CTA principal: {{CTA_PRINCIPAL}}
- CTA secundario: {{CTA_SECUNDARIO}}
- Idioma principal: {{IDIOMA}}
- Tema preferido: {{TEMA}}
- Dirección visual específica de esta app: {{DIRECCION_VISUAL}}
- Elementos diferenciales del producto: {{DIFERENCIALES}}
- Pruebas de confianza disponibles: {{PRUEBAS_CONFIANZA}}
- Secciones opcionales: {{SECCIONES_OPCIONALES}}
- Restricciones o exclusiones: {{RESTRICCIONES}}

Contexto de marca y sistema:
La landing debe pertenecer al ecosistema Anclora Group y respetar su gramática premium compartida:
- Debe transmitir valor, criterio, sofisticación y claridad operativa.
- El primer viewport debe explicar con rapidez qué es el producto y cuál es la siguiente acción.
- Solo puede haber un CTA dominante en el hero.
- La interfaz debe sentirse premium, editorial y deliberada, no un dashboard interno decorado.
- Se permiten gradientes, profundidad visual, textura, overlays, glass sutil y tipografía con intención.
- La lectura debe seguir siendo clara, sobria y muy usable.
- El motion debe ser refinado: fade suave, rise corto, stagger breve y highlight narrativo contenido.
- No usar bounce, efectos teatrales, ruido visual, ni animaciones que dificulten lectura o clic.
- La landing debe poder servir luego como base reusable para otras apps del ecosistema.

Instrucciones de diseño:
1. Diseña un esqueleto premium de landing page reusable y modular.
2. No diseñes una página genérica SaaS. Debe sentirse propia de una marca premium europea, sofisticada, tecnológica y editorial.
3. La propuesta debe tener estructura clara de conversión, pero con sensibilidad estética alta.
4. Mantén una arquitectura de secciones flexible para reutilizarla luego en otras aplicaciones del ecosistema.
5. Prioriza jerarquía visual, ritmo de lectura, claridad del mensaje y sensación de marca.
6. Debe funcionar especialmente bien en desktop y mobile.
7. Evita clichés visuales de startup, gradients violetas genéricos, mockups irrelevantes y bloques intercambiables sin carácter.
8. Si faltan datos, completa con supuestos plausibles alineados con una marca premium de Anclora Group.

Quiero que entregues exactamente lo siguiente:

1. Concepto creativo de la landing
- una frase que defina la dirección conceptual
- adjetivos de marca
- sensación que debe dejar al usuario en los primeros 5 segundos

2. Sistema visual propuesto
- dirección de color
- tratamiento de fondos
- estilo de tipografía
- comportamiento de cards, botones y superficies
- principios de motion
- estilo fotográfico o de ilustración si aplica

3. Arquitectura de la landing
Define el orden ideal de secciones con objetivo de cada una:
- hero
- prueba de valor
- problema/oportunidad
- solución
- beneficios
- producto o experiencia
- prueba social / autoridad
- FAQ
- CTA final
- footer premium

4. Wireframe narrado
Describe cada sección como si fuera un wireframe de alta fidelidad en texto:
- contenido principal
- layout
- jerarquía
- tipo de componente
- tono del copy
- CTA
- comportamiento responsive

5. Reglas de adaptación
Explica qué partes son:
- invariantes del sistema Anclora
- personalizables por cada aplicación
- opcionales según tipo de producto

6. Prompt final de generación visual
Redacta después un prompt corto y muy potente para usar en una IA de diseño/UI que genere la landing manteniendo este sistema.

Importante:
- No escribas código.
- No propongas implementaciones técnicas.
- No hagas una landing recargada.
- No conviertas el resultado en un dashboard.
- No abuses de buzzwords.
- Todo debe respirar premium, precisión, confianza y deseo de exploración.
```

## Prompt cerrado para esqueleto base

```text
Actúa como director creativo senior y diseñador de producto premium para Anclora Group.

Diseña el esqueleto premium de una landing page base reusable para cualquier aplicación actual o futura del ecosistema Anclora. No es una landing para una app concreta, sino la plantilla madre sobre la que luego se adaptarán productos específicos.

Debes respetar estos principios de sistema:

- La landing pertenece a un ecosistema premium, editorial y tecnológico.
- Debe transmitir sofisticación, confianza, criterio y ambición silenciosa.
- El primer viewport debe explicar de inmediato qué es el producto y cuál es la acción principal.
- Solo un CTA dominante por viewport principal.
- La estética debe sentirse premium, no corporativa genérica ni startup genérica.
- Puede usar gradientes, profundidad, textura, overlays y glass sutil, pero siempre con control.
- Debe haber claridad operativa, jerarquía fuerte y conversión limpia.
- El motion debe ser sobrio y refinado: fade suave, rise corto, stagger breve y detalles narrativos contenidos.
- Quedan prohibidos los efectos teatrales, el bounce, el ruido visual y los patrones visuales intercambiables sin carácter.
- La estructura debe servir tanto para apps premium de tipo editorial, analítico, operativo, data, AI o servicio digital.
- Debe funcionar en desktop y mobile sin perder presencia ni claridad.
- No debe parecer un dashboard interno maquillado.
- La experiencia debe sentirse como “premium product entry point”, no como simple página promocional.

Dirección visual base:
- inspiración premium europea contemporánea
- mezcla de lujo silencioso, precisión digital y atmósfera editorial
- fondos con profundidad y textura sutil
- paleta premium sobria, con opción de acento firma tipo gold / deep teal / navy o equivalentes según producto
- tipografía con personalidad y alta legibilidad
- cards limpias, separación clara, hover medido
- botones premium con presencia clara pero sin agresividad

Tu tarea:
Diseña una landing page base premium, modular y reusable para el ecosistema Anclora.

Quiero que entregues exactamente esto:

1. Idea rectora
Define el concepto creativo central de la landing en 3-5 líneas.

2. Principios visuales
Describe:
- color
- tipografía
- fondos
- superficies
- botones
- ritmo visual
- motion
- uso de imágenes o renders

3. Estructura maestra de la landing
Propón el orden ideal de secciones para la plantilla base, incluyendo:
- hero premium
- value proposition
- credibility / authority layer
- pain / opportunity framing
- modular feature narrative
- experience / product showcase
- trust / proof
- FAQ
- CTA final
- footer

4. Wireframe detallado en texto
Para cada sección, describe:
- objetivo
- contenido
- layout
- jerarquía visual
- tono del copy
- componente dominante
- comportamiento responsive

5. Sistema de modularidad
Explica qué bloques deben mantenerse siempre y cuáles deben poder intercambiarse según el tipo de app del ecosistema.

6. Prompt visual final
Escribe un prompt final, corto y potente, listo para pegar en una IA de diseño, para generar esta landing base con look premium Anclora.

Condiciones:
- No escribas código.
- No escribas texto legal ni copy final demasiado concreto.
- No hagas una propuesta genérica SaaS.
- No diseñes una landing excesivamente lujosa o barroca.
- Busca equilibrio entre elegancia, conversión, claridad y carácter de marca.
```

## Nota de uso

Si el producto concreto pertenece a una familia ya definida del ecosistema, conviene añadir al prompt:

- referencias de color y tono de esa app, por ejemplo [[Anclora Talent]]
- casos de referencia visual como [[Azure Bay - Caso de estudio de landing premium]]
- criterios técnicos o narrativos de [[Anclora Portfolio - Base técnica reutilizable]]

## Relacionado

- [[Azure Bay - Caso de estudio de landing premium]]
- [[Anclora Portfolio - Base técnica reutilizable]]
- [[Anclora Talent]]
- [[ANCLORA_PREMIUM_APP_CONTRACT]]
- [[ANCLORA_ECOSYSTEM_CONTRACT_GROUPS]]
- [[UI_MOTION_CONTRACT]]
