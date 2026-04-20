# Independent Products Separation Design

## Goal

Define how `Independent Products` should live inside the vault as a parallel portfolio to `Anclora Group`, without contaminating Anclora branding, contracts, inventory, or governance semantics.

This spec covers:

- vault structure for `Independent Products`
- governance/inventory model
- taxonomy for public utility and micro-SaaS products
- contract baseline for this new universe
- initial registration model for `anclora-calculadora-fiscal-183`

This spec does not yet cover:

- implementation of a dedicated design system for `Independent Products`
- automation changes to existing Anclora scripts
- migration of multiple independent products beyond the first inventory seed

## Context

`Anclora Group` is positioned as a premium ecosystem oriented to high-value products, investor-facing experiences, and a more selective brand universe. Public micro-SaaS utilities monetized through Ads, SEO, affiliate flows, or lead generation do not fit cleanly inside that brand architecture.

The user wants those products documented and governed inside the same Obsidian vault, but clearly separated from the Anclora ecosystem.

That separation must be explicit at four levels:

1. brand
2. inventory/governance
3. contracts
4. future design system alignment

## Decision

Create a parallel universe inside the vault called `Independent Products`.

This universe is:

- documented in the same vault
- governed separately from `Anclora Group`
- not treated as part of the Anclora premium product ecosystem
- allowed to reuse internal knowledge and design discipline
- not allowed to inherit Anclora branding by default

## Options Considered

### Option 1: Parallel inventory and separate governance

Keep `Anclora Group` inventory untouched and create a second governance layer for `Independent Products`.

Pros:

- clean separation of brand and product universes
- no ambiguity in contracts
- no contamination of Anclora inventory semantics
- easier to reason about long term

Cons:

- two inventories instead of one
- future scripts may need optional support for a second universe

### Option 2: Single inventory with a top-level portfolio field

Merge both universes into one JSON inventory and differentiate using a root discriminator such as `portfolio`.

Pros:

- one source of truth
- easier for future cross-portfolio analytics

Cons:

- forces review of current Anclora scripts and views
- higher risk of accidental mixing
- worse conceptual separation for now

### Option 3: Informal notes only

Document these products as plain notes/projects without formal governance files.

Pros:

- minimal upfront work

Cons:

- poor scalability
- weak retrieval/governance
- not coherent with how the rest of the vault is managed

## Chosen Approach

Choose Option 1.

Create a parallel inventory and contract model for `Independent Products`, while keeping `docs/governance/ecosystem-repos.json` reserved for `Anclora Group`.

## Information Architecture

### Governance Files

Add:

- `docs/governance/independent-products.json`

Keep unchanged:

- `docs/governance/ecosystem-repos.json` as the Anclora-only inventory

### Canonical Notes

Add:

- `resources/Independent Products.md`

Purpose:

- human-facing map of this second universe
- rationale for separation from Anclora Group
- quick navigation to products, taxonomy, and contracts

### Standards

Add:

- `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`

Purpose:

- define baseline UX/product rules for public utility apps
- keep it clearly outside Anclora brand contracts

## Taxonomy for Independent Products

The taxonomy for this new universe should not reuse Anclora group semantics mechanically.

Each entry in `independent-products.json` should include:

- `id`
- `name`
- `path_wsl`
- `path_windows`
- `portfolio`
- `domain`
- `business_model`
- `product_archetype`
- `auth_model`
- `distribution_model`
- `design_system_role`
- `status`
- `obsidian_note`
- `high_impact_paths`

### Field Semantics

- `portfolio`
  - always `independent_products` for this inventory

- `domain`
  - the real problem space of the app
  - examples:
    - `fiscal_finance`
    - `business_finance`
    - `mobility_compliance`
    - `real_estate_finance`

- `business_model`
  - monetization model
  - examples:
    - `ads`
    - `affiliate`
    - `lead_gen`
    - `subscription`

- `product_archetype`
  - the functional nature of the product
  - examples:
    - `tool`
    - `calculator`
    - `comparator`
    - `content_site`

- `auth_model`
  - whether the product requires authentication
  - examples:
    - `public_no_auth`
    - `optional_auth`
    - `required_auth`

- `distribution_model`
  - primary traffic/distribution pattern
  - examples:
    - `seo`
    - `social`
    - `paid`
    - `direct`

- `design_system_role`
  - current relation to shared design logic
  - initial values:
    - `custom`
    - `independent_consumer`

- `status`
  - `draft`, `active`, `paused`, `archived`

## Initial Seed Entry

The first registered product should be `anclora-calculadora-fiscal-183` with this model:

- `portfolio = independent_products`
- `domain = fiscal_finance`
- `business_model = ads`
- `product_archetype = calculator`
- `auth_model = public_no_auth`
- `distribution_model = seo`
- `design_system_role = custom`
- `status = active`

## Contract Model

`INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md` should define a baseline for public utility products that are:

- fast to understand
- public
- often SEO-first
- optionally monetized with Ads, affiliate blocks, or lead generation
- intentionally separate from Anclora premium brand semantics

### Contract Principles

- no Anclora branding by default
- no Anclora icon system by default
- no Anclora premium visual grammar by default
- mobile-first layout discipline
- clear input/output flow
- result readability is critical
- SEO blocks must remain legible and useful
- ad placements must not destroy trust or primary task completion
- performance is a first-order requirement

### Core UI Expectations

The contract should bias toward:

- concise hero/value statement
- simple form inputs
- deterministic result cards
- FAQ or explanatory blocks
- trust/compliance notices when needed
- ad-safe layout zones
- visible but non-invasive monetization

## Relationship to `anclora-design-system`

At this stage, `Independent Products` should not be treated as normal consumers of Anclora brand contracts or Anclora premium UI patterns.

The correct relationship is:

- they may reuse internal design know-how
- they do not inherit Anclora branding
- they do not inherit Anclora iconography
- they do not automatically inherit Anclora premium contracts

Initial rule:

- document them as separate from `anclora-design-system`
- allow future extraction of shared neutral primitives if volume justifies it

Practical implication:

- do not register them as part of the Anclora ecosystem inventory
- do not classify them under Anclora `internal`, `premium`, `ultra_premium`, or `portfolio`
- do not force them into Anclora UI/brand contracts

## Success Criteria

This design is successful when:

1. the vault can document `Independent Products` cleanly without mixing them into Anclora governance
2. `anclora-calculadora-fiscal-183` has a formal place in the vault
3. contracts for these apps are clearly separated from Anclora brand contracts
4. future independent products can be added without revisiting the model

## Implementation Scope for the Next Plan

The next implementation plan should cover only the structural first slice:

- create `docs/governance/independent-products.json`
- create `resources/Independent Products.md`
- create `docs/standards/INDEPENDENT_PUBLIC_UTILITY_APP_CONTRACT.md`
- register `anclora-calculadora-fiscal-183` as the first entry
- add explicit links from the human-facing note to the inventory and contract

Follow-on work should be planned separately for:

- optional script support for independent-products inventory
- dashboards or views over the new portfolio
- future neutral/shared design layer for public utility products
