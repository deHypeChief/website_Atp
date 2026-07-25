export const API_URL = (import.meta.env.VITE_SERVER_API || '/api').replace(/\/$/, '')
export const CLIENT_URL = (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')
export const SHOP_URL = (import.meta.env.VITE_SHOP_URL || window.location.origin).replace(/\/$/, '')

export const DEFAULT_SETTINGS = {
  name: 'ATP Royal',
  announcement: 'Complimentary Abuja delivery on orders over ₦75,000',
  heroEyebrow: 'ATP Royal / Collection 01',
  heroTitle: 'Dress for the next point.',
  heroSubtitle: 'Court-built essentials and club pieces for the way you play, train and move.',
  heroImage: '',
  primaryCta: 'Shop the collection',
  secondaryCta: 'Explore court gear',
  deliveryNote: 'Abuja delivery in 1–2 working days. Nationwide delivery in 3–5 working days.',
  returnsNote: 'Easy exchanges on unworn items within 7 days.',
}

export const money = value => `₦${Number(value || 0).toLocaleString('en-NG')}`
