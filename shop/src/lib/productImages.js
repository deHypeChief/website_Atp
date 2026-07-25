import apparel from '../assets/brand/apparel.png'
import equipment from '../assets/brand/equipment.png'
import accessories from '../assets/brand/accessories.png'

const fallbackByCategory = {
  apparel,
  equipment,
  accessories,
  bags: accessories,
}

export const productFallback = category => fallbackByCategory[String(category || '').toLowerCase()] || accessories

export const productImage = (source, category) => {
  if (!source || /^https?:\/\/localhost:3000(?:\/|$)/i.test(source)) return productFallback(category)
  return source
}

export const recoverProductImage = (event, category) => {
  const fallback = productFallback(category)
  if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback
  event.currentTarget.onerror = null
}
