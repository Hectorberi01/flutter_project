export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  phone?: string
  address?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: Product
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash_on_delivery' | 'mobile_money' | 'card' | 'bank_transfer'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  totalAmount: number
  shippingAddress?: string
  notes?: string
  items: OrderItem[]
  user?: User
  userId: string
  createdAt: string
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  revenue: number
  totalProducts: number
  outOfStock: number
  totalUsers: number
  adminCount: number
  statusBreakdown: Record<string, number>
  categoryBreakdown: Record<string, number>
}

export interface AuthState {
  token: string | null
  user: User | null
}
