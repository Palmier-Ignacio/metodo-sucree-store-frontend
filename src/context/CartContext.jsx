import { createContext, useContext, useMemo, useState } from 'react'
import { discountedPrice } from '../utils/formatters'
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('sucree_cart') || '[]'))
  const persist = (next) => { setItems(next); localStorage.setItem('sucree_cart', JSON.stringify(next)) }
  const addItem = (product) => !items.some(i => i.id === product.id) && persist([...items, { ...product, quantity: 1 }])
  const removeItem = (id) => persist(items.filter(i => i.id !== id))
  const clearCart = () => persist([])
  const total = items.reduce((acc, item) => {
    const finalPrice = discountedPrice(item.price, item.discount_percent)
    return acc + finalPrice * (item.quantity || 1)
  }, 0)
  const value = useMemo(() => ({ items, total, addItem, removeItem, clearCart }), [items, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)
