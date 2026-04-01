import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Layout } from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CataloguePage from './pages/CataloguePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import { OrdersPage, OrderDetailPage } from './pages/OrdersPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { FavoritesPage, ProfilePage } from './pages/ExtraPages'
import { Spinner } from './components/ui'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size={32} /></div>
  if (!user) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isLoading } = useAuth()
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size={32} /></div>

  return (
    <Routes>
      {/* Auth (sans layout) */}
      <Route path="/connexion"  element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      {/* Public avec layout */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/catalogue" element={<Layout><CataloguePage /></Layout>} />
      <Route path="/produit/:id" element={<Layout><ProductDetailPage /></Layout>} />
      <Route path="/panier" element={<Layout><CartPage /></Layout>} />

      {/* Protégé */}
      <Route path="/commande" element={<RequireAuth><Layout><CheckoutPage /></Layout></RequireAuth>} />
      <Route path="/commandes" element={<RequireAuth><Layout><OrdersPage /></Layout></RequireAuth>} />
      <Route path="/commandes/:id" element={<RequireAuth><Layout><OrderDetailPage /></Layout></RequireAuth>} />
      <Route path="/favoris" element={<RequireAuth><Layout><FavoritesPage /></Layout></RequireAuth>} />
      <Route path="/mon-compte" element={<RequireAuth><Layout><ProfilePage /></Layout></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
