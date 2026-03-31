import axios from 'axios'
import type { User, Product, Order, ProductListResponse, OrderStatus } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Rediriger vers /login si 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data as { token: string; user: User }
  },
  getMe: async () => {
    const { data } = await api.get('/users/me')
    return data as User
  },
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: async () => {
    const [ordersRes, productsRes, usersRes] = await Promise.all([
      api.get('/orders/admin/all'),
      api.get('/products?limit=200'),
      api.get('/users'),
    ])

    const orders: Order[] = ordersRes.data
    const products: Product[] = productsRes.data.products
    const users: User[] = usersRes.data

    const revenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((s, o) => s + Number(o.totalAmount), 0)

    const statusBreakdown: Record<string, number> = {}
    orders.forEach((o) => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1
    })

    const categoryBreakdown: Record<string, number> = {}
    products.forEach((p) => {
      const cat = p.category || 'Autre'
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
    })

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      revenue,
      totalProducts: products.length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      totalUsers: users.length,
      adminCount: users.filter((u) => u.role === 'admin').length,
      statusBreakdown,
      categoryBreakdown,
      recentOrders: orders.slice(0, 8),
    }
  },
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: async (params?: { search?: string; category?: string; page?: number }) => {
    const { data } = await api.get('/products', { params: { limit: 100, ...params } })
    return data as ProductListResponse
  },
  create: async (body: Partial<Product>) => {
    const { data } = await api.post('/products', body)
    return data as Product
  },
  update: async (id: string, body: Partial<Product>) => {
    const { data } = await api.patch(`/products/${id}`, body)
    return data as Product
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`)
  },
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: async () => {
    const { data } = await api.get('/orders/admin/all')
    return data as Order[]
  },
  updateStatus: async (id: string, status: OrderStatus) => {
    const { data } = await api.patch(`/orders/${id}/status`, { status })
    return data as Order
  },
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async () => {
    const { data } = await api.get('/users')
    return data as User[]
  },
  delete: async (id: string) => {
    await api.delete(`/users/${id}`)
  },
}
