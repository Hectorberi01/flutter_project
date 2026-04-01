import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { cartApi } from '../api'
import type { Cart } from '../types'
import { useAuth } from './AuthContext'

interface CartCtx {
  cart: Cart | null
  isLoading: boolean
  addItem: (productId: string, qty?: number) => Promise<void>
  updateItem: (itemId: string, qty: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  reload: () => Promise<void>
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!user) { setCart(null); return }
    setIsLoading(true)
    try { setCart(await cartApi.get()) } finally { setIsLoading(false) }
  }, [user])

  useEffect(() => { reload() }, [reload])

  const addItem = async (productId: string, qty = 1) => {
    const c = await cartApi.add(productId, qty)
    setCart(c)
  }
  const updateItem = async (itemId: string, qty: number) => {
    const c = await cartApi.update(itemId, qty)
    setCart(c)
  }
  const removeItem = async (itemId: string) => {
    const c = await cartApi.remove(itemId)
    setCart(c)
  }
  const clearCart = async () => {
    await cartApi.clear()
    setCart(prev => prev ? { ...prev, items: [], total: 0 } : null)
  }

  return (
    <CartContext.Provider value={{ cart, isLoading, addItem, updateItem, removeItem, clearCart, reload }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
