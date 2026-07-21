import { useEffect, useState } from "react";

const KEY = "atp-store-cart";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (items) => { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event("atp-cart-change")); };

export function addToCart(product) {
  const items = read();
  const found = items.find(item => item._id === product._id);
  if (found) found.quantity = Math.min(product.stock, found.quantity + 1);
  else items.push({ _id: product._id, name: product.name, price: product.price, image: product.images?.[0] || "", stock: product.stock, quantity: 1 });
  write(items);
}
export const updateCartItem = (id, quantity) => write(read().map(item => item._id === id ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item));
export const removeCartItem = id => write(read().filter(item => item._id !== id));
export const clearCart = () => write([]);
export function useCart() {
  const [items, setItems] = useState(read);
  useEffect(() => { const sync = () => setItems(read()); window.addEventListener("atp-cart-change", sync); return () => window.removeEventListener("atp-cart-change", sync); }, []);
  return { items, count: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
}
