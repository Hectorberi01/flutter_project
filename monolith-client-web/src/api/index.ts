import axios from 'axios'
import type { User, Product, ProductListResponse, Cart, Order, Favorite, PaymentMethod } from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('client_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('client_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data as { token: string; user: User }
  },
  register: async (name: string, email: string, password: string, phone?: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone })
    return data as { user: User }
  },
  getMe: async () => {
    const { data } = await api.get('/users/me')
    return data as User
  },
  updateMe: async (body: Partial<Pick<User, 'name' | 'phone' | 'address'>>) => {
    const { data } = await api.patch('/users/me', body)
    return data as User
  },
}

export const productsApi = {
  getAll: async (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/products', { params: { limit: 20, ...params } })
    return data as ProductListResponse
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/products/${id}`)
    return data as Product
  },
}

export const cartApi = {
  get: async () => {
    const { data } = await api.get('/cart')
    return data as Cart
  },
  add: async (productId: string, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity })
    return data as Cart
  },
  update: async (itemId: string, quantity: number) => {
    const { data } = await api.patch(`/cart/${itemId}`, { quantity })
    return data as Cart
  },
  remove: async (itemId: string) => {
    const { data } = await api.delete(`/cart/${itemId}`)
    return data as Cart
  },
  clear: async () => { await api.delete('/cart') },
}

export const ordersApi = {
  getAll: async () => {
    const { data } = await api.get('/orders')
    return data as Order[]
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`)
    return data as Order
  },
  checkout: async (shippingAddress: string, paymentMethod: PaymentMethod, notes?: string) => {
    const { data } = await api.post('/orders', { shippingAddress, paymentMethod, notes })
    const orderId = (data as any).id
    try {
      const { data: full } = await api.get(`/orders/${orderId}`)
      return full as Order
    } catch { return data as Order }
  },
  cancel: async (id: string) => {
    const { data } = await api.patch(`/orders/${id}/cancel`)
    return data as Order
  },
}

export const favoritesApi = {
  getAll: async () => {
    const { data } = await api.get('/favorites')
    return data as Favorite[]
  },
  toggle: async (productId: string) => {
    const { data } = await api.post(`/favorites/toggle/${productId}`)
    return data as { added: boolean; message: string }
  },
}
