import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getMyLibrary, getProductById } from '../services/api'
import { useAuth } from './AuthContext'
import { discountedPrice } from '../utils/formatters'

const CartContext = createContext(null)

function readStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('sucree_cart') || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function normalizeLibraryIds(payload) {
  const products = payload?.products || payload?.library || payload || []

  if (!Array.isArray(products)) return new Set()

  return new Set(
    products
      .map((product) => product.product_id || product.id)
      .filter(Boolean)
  )
}

function normalizeProduct(payload) {
  return payload?.product || payload
}

export function CartProvider({ children }) {
  const { user, getAccessToken } = useAuth()
  const [items, setItems] = useState(readStoredCart)
  const [ownedProductIds, setOwnedProductIds] = useState(new Set())
  const [refreshingCart, setRefreshingCart] = useState(false)

  const persist = useCallback((next) => {
    setItems(next)
    localStorage.setItem('sucree_cart', JSON.stringify(next))
  }, [])

  const refreshOwnedProducts = useCallback(async () => {
    if (!user) {
      setOwnedProductIds(new Set())
      return new Set()
    }

    try {
      const token = await getAccessToken()

      if (!token) {
        setOwnedProductIds(new Set())
        return new Set()
      }

      const data = await getMyLibrary(token)
      const ids = normalizeLibraryIds(data)
      setOwnedProductIds(ids)
      return ids
    } catch (error) {
      console.error('Error cargando productos comprados:', error)
      setOwnedProductIds(new Set())
      return new Set()
    }
  }, [user, getAccessToken])

  const addItem = useCallback((product) => {
    if (!product?.id) return false

    if (ownedProductIds.has(product.id)) {
      return false
    }

    if (items.some((item) => item.id === product.id)) {
      return false
    }

    persist([...items, { ...product, quantity: 1 }])
    return true
  }, [items, ownedProductIds, persist])

  const removeItem = useCallback((id) => {
    persist(items.filter((item) => item.id !== id))
  }, [items, persist])

  const clearCart = useCallback(() => {
    persist([])
  }, [persist])

  const refreshCart = useCallback(async () => {
    if (!items.length) return []

    try {
      setRefreshingCart(true)

      const ownedIds = await refreshOwnedProducts()

      const freshProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const data = await getProductById(item.id)
            return normalizeProduct(data)
          } catch (error) {
            console.error('Error actualizando producto del carrito:', item.id, error)
            return null
          }
        })
      )

      const updated = freshProducts
        .filter((product) => product?.id)
        .filter((product) => !ownedIds.has(product.id))
        .filter((product) => product.is_active !== false)
        .filter((product) => !product.status || product.status === 'published')
        .map((product) => ({ ...product, quantity: 1 }))

      persist(updated)
      return updated
    } finally {
      setRefreshingCart(false)
    }
  }, [items, persist, refreshOwnedProducts])

  useEffect(() => {
    refreshOwnedProducts()
  }, [refreshOwnedProducts])

  const total = useMemo(() => items.reduce((acc, item) => {
    const finalPrice = discountedPrice(item.price, item.discount_percent)
    return acc + finalPrice * (item.quantity || 1)
  }, 0), [items])

  const value = useMemo(() => ({
    items,
    total,
    ownedProductIds,
    refreshingCart,
    addItem,
    removeItem,
    clearCart,
    refreshCart,
    refreshOwnedProducts,
  }), [
    items,
    total,
    ownedProductIds,
    refreshingCart,
    addItem,
    removeItem,
    clearCart,
    refreshCart,
    refreshOwnedProducts,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
