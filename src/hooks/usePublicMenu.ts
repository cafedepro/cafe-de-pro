import { useEffect, useState } from 'react'
import { fetchPublicMenu } from '../services/publicMenu'
import type { PublicMenu } from '../types/menu'

export type PublicMenuState =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: PublicMenu }

export function usePublicMenu(slug: string | undefined): PublicMenuState {
  const [state, setState] = useState<PublicMenuState>({ status: 'loading' })

  useEffect(() => {
    if (!slug) {
      setState({ status: 'notfound' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    fetchPublicMenu(slug)
      .then((data) => {
        if (!cancelled) setState(data ? { status: 'ready', data } : { status: 'notfound' })
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ status: 'error', message: e instanceof Error ? e.message : 'Could not load the menu.' })
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return state
}
