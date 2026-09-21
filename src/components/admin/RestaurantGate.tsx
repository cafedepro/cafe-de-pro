import { Navigate, Outlet } from 'react-router-dom'
import { useRestaurant } from '../../context/RestaurantContext'
import { Button, FullScreenMessage } from './ui'

// Anything inside this gate requires the owner to already have a restaurant.
export default function RestaurantGate() {
  const { restaurant, loading, error, refresh } = useRestaurant()

  if (loading) return <FullScreenMessage>Loading your restaurant…</FullScreenMessage>
  if (error)
    return (
      <FullScreenMessage>
        <div className="space-y-3 text-center">
          <p>{error}</p>
          <Button onClick={() => void refresh()}>Try again</Button>
        </div>
      </FullScreenMessage>
    )
  if (!restaurant) return <Navigate to="/admin/onboarding" replace />
  return <Outlet />
}
