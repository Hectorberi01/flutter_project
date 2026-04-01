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

export interface CartItem {
  id: string
  quantity: number
  cartId: string
  productId: string
  product: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  total: number
}

export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: Product
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash_on_delivery' | 'mobile_money' | 'card' | 'bank_transfer'

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  paymentStatus: string
  paymentMethod: PaymentMethod
  totalAmount: number
  shippingAddress?: string
  notes?: string
  items: OrderItem[]
  createdAt: string
}

export interface Favorite {
  id: string
  productId: string
  product: Product
  createdAt: string
}
