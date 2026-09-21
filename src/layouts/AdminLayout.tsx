import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LayoutList, LogOut, QrCode, Settings, Store, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRestaurant } from '../context/RestaurantContext'
import { cn } from '../lib/utils'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/restaurant', label: 'Restaurant', icon: Store },
  { to: '/admin/categories', label: 'Categories', icon: LayoutList },
  { to: '/admin/items', label: 'Menu items', icon: UtensilsCrossed },
  { to: '/admin/qr', label: 'QR codes', icon: QrCode },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  const { restaurant } = useRestaurant()

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="border-b border-stone-200 bg-white md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:block md:py-5">
          <p className="truncate font-semibold">{restaurant?.name}</p>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-stone-600 hover:bg-stone-100 md:mt-3 md:px-0"
          >
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:pb-4">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-emerald-50 text-emerald-900' : 'text-stone-700 hover:bg-stone-100',
                )
              }
            >
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
