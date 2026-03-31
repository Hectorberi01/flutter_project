import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminApp() {
  const [refresh, setRefresh] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefresh(r => r + 1)
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <AppLayout pendingCount={0} onRefresh={handleRefresh} refreshing={refreshing}>
      <Routes>
        <Route path="/" element={<DashboardPage refresh={refresh} />} />
        <Route path="/products" element={<ProductsPage refresh={refresh} />} />
        <Route path="/orders" element={<OrdersPage refresh={refresh} />} />
        <Route path="/users" element={<UsersPage refresh={refresh} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
