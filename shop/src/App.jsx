import { BrowserRouter, Route, Routes } from 'react-router-dom'
import StoreLayout from './components/StoreLayout'
import AuthCallback from './pages/AuthCallback'
import Cart from './pages/Cart'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import PaymentCallback from './pages/PaymentCallback'
import ProductDetail from './pages/ProductDetail'
import { StoreDataProvider } from './store/data'
import './App.css'

export default function App() {
  return <BrowserRouter><StoreDataProvider><Routes><Route element={<StoreLayout />}><Route index element={<Home />} /><Route path="catalog" element={<Catalog />} /><Route path="product/:slug" element={<ProductDetail />} /><Route path="cart" element={<Cart />} /><Route path="payment/callback" element={<PaymentCallback />} /><Route path="auth/callback" element={<AuthCallback />} /><Route path="*" element={<NotFound />} /></Route></Routes></StoreDataProvider></BrowserRouter>
}
