import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getMyRestaurant } from '../services/restaurants'
import type { Restaurant } from '../types/database'

interface RestaurantState {
  restaurant: Restaurant | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setRestaurant: (r: Restaurant | null) => void
}

const RestaurantContext = createContext<RestaurantState | null>(null)

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      setRestaurant(await getMyRestaurant(user.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your restaurant.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, error, refresh, setRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant(): RestaurantState {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error('useRestaurant must be used inside <RestaurantProvider>')
  return ctx
}
