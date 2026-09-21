import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/admin/ProtectedRoute'
import RestaurantGate from './components/admin/RestaurantGate'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import OnboardingPage from './pages/admin/OnboardingPage'
import DashboardPage from './pages/admin/DashboardPage'
import ComingSoonPage from './pages/admin/ComingSoonPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import MenuItemsPage from './pages/admin/MenuItemsPage'
import RestaurantPage from './pages/admin/RestaurantPage'
import SettingsPage from './pages/admin/SettingsPage'
import QrPage from './pages/admin/QrPage'
import MenuPage from './pages/customer/MenuPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/menu/:restaurantSlug" element={<MenuPage />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route element={<RestaurantGate />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="restaurant" element={<RestaurantPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="items" element={<MenuItemsPage />} />
            <Route path="qr" element={<QrPage />} />
            <Route path="analytics" element={<ComingSoonPage title="Analytics" />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
