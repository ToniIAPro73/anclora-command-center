import type { ReactNode } from 'react'
import type { DataState } from '../../contracts/types'

interface DataStateViewProps<T> {
  state: DataState<T>
  labels: {
    loading: string
    empty: string
    unavailable: string
    error: string
    staleNote: (asOf: string) => string
  }
  children: (data: T) => ReactNode
}

/**
 * Renderiza cualquier DataState<T> de forma consistente: LOADING/READY/EMPTY/STALE/ERROR/UNAVAILABLE.
 * Un fallo de una fuente (Knowledge/AOS) nunca debe tumbar el resto de la interfaz — ver Seccion 17.
 */
export function DataStateView<T>({ state, labels, children }: DataStateViewProps<T>) {
  switch (state.status) {
    case 'LOADING':
      return (
        <div className="op-state op-state--loading" role="status">
          {labels.loading}
        </div>
      )
    case 'EMPTY':
      return (
        <div className="op-state op-state--empty" role="status">
          {labels.empty}
        </div>
      )
    case 'UNAVAILABLE':
      return (
        <div className="op-state op-state--unavailable" role="alert">
          {labels.unavailable}
          <span className="op-state__detail">{state.reason}</span>
        </div>
      )
    case 'ERROR':
      return (
        <div className="op-state op-state--error" role="alert">
          {labels.error}
          <span className="op-state__detail">{state.message}</span>
        </div>
      )
    case 'STALE':
      return (
        <div className="op-state-wrapper">
          <p className="op-state op-state--stale" role="status">
            {labels.staleNote(state.asOf)}
          </p>
          {children(state.data)}
        </div>
      )
    case 'READY':
      return <>{children(state.data)}</>
    default:
      return null
  }
}
