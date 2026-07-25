/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'atp-royal-cart'
const CartContext = createContext(null)
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const variantKey = item => `${item._id}:${item.size || ''}:${item.color || ''}`

export function CartProvider({ children }) {
  const [items, setItems] = useState(read)
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)) }, [items])

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    add(product, options = {}) {
      setItems(current => {
        const incoming = { _id: product._id, slug: product.slug, name: product.name, category: product.category, price: product.price, image: product.images?.[0] || '', stock: product.stock, quantity: 1, size: options.size || '', color: options.color || '' }
        const key = variantKey(incoming)
        const found = current.find(item => variantKey(item) === key)
        return found ? current.map(item => variantKey(item) === key ? { ...item, stock: product.stock, quantity: Math.min(product.stock, item.quantity + 1) } : item) : [...current, incoming]
      })
    },
    update(key, quantity) { setItems(current => current.map(item => variantKey(item) === key ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item)) },
    remove(key) { setItems(current => current.filter(item => variantKey(item) !== key)) },
    clear() { setItems([]) },
    keyFor: variantKey,
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
