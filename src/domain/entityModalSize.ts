// entityModalSize — deterministic adaptive size selection for entity detail
// modals (COMMAND_CENTER_ADAPTIVE_DETAIL_MODALS).
//
// The modal geometry scale lives in the Design System (.ac-modal--compact |
// --medium | --wide | --large, modal.css). This module only decides WHICH
// class an entity gets. The rule is type-first, then content density:
//
//   density = propertyCount + statusCount + relationshipCount
//
//   Repository  -> wide (Git/CBM/properties/relationship sets are dense)
//   Technology  -> compact (spec: never a giant modal just because
//                  Repository needs one)
//   Product     -> medium (comfortable working space)
//   Service     -> wide when live AOS runtime is present, else density-driven
//   Endpoint    -> wide when a live AOS match exists (spec 11/18), else
//                  density-driven
//   Standard    -> compact if nearly empty, wide if metadata-rich, else medium
//   BusinessUnit-> compact unless many properties/relationships (-> medium)
//   generic     -> compact <= 4, wide >= 14, medium in between; large >= 24
//
// Deterministic, no text measurement, no layout polling. A Technology feels
// compact; a Repository is wide enough to show operational info un-cramped.

export type EntityModalSize = 'compact' | 'medium' | 'wide' | 'large'

export interface EntityModalSizeInput {
  type: string | undefined
  propertyCount: number
  statusCount: number
  relationshipCount: number
  /** Live AOS section present (endpoint match / operational endpoint). */
  liveAos: boolean
  /** Live AOS service runtime section present. */
  runtimePresent: boolean
}

const DENSITY_MEDIUM = 4
const DENSITY_WIDE = 14
const DENSITY_LARGE = 24

export function getEntityModalSize(input: EntityModalSizeInput): EntityModalSize {
  const density = input.propertyCount + input.statusCount + input.relationshipCount

  switch (input.type) {
    case 'Repository':
      return 'wide'
    case 'Technology':
      return 'compact'
    case 'Product':
      return 'medium'
    case 'Service':
      if (input.runtimePresent) return 'wide'
      return density >= DENSITY_WIDE ? 'wide' : 'medium'
    case 'Endpoint':
      if (input.liveAos) return 'wide'
      return density >= DENSITY_WIDE ? 'wide' : 'medium'
    case 'Standard':
      if (density <= DENSITY_MEDIUM) return 'compact'
      return density >= DENSITY_WIDE ? 'wide' : 'medium'
    case 'BusinessUnit':
      return density >= 8 ? 'medium' : 'compact'
    default:
      if (density >= DENSITY_LARGE) return 'large'
      if (density >= DENSITY_WIDE) return 'wide'
      if (density <= DENSITY_MEDIUM) return 'compact'
      return 'medium'
  }
}