import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { createCheckout, getUser } from '../lib/api'
import { clientAuthUrl } from '../lib/auth'
import { money } from '../lib/config'
import { productImage, recoverProductImage } from '../lib/productImages'
import { useCart } from '../store/cart'

export default function Cart() {
  const cart = useCart()
  const user = getUser()
  const [delivery, setDelivery] = useState({ name: user?.fullName || '', phone: user?.phoneNumber || '', address: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const checkout = async event => {
    event.preventDefault()
    if (!user) { window.location.assign(clientAuthUrl('login', '/cart')); return }
    setSubmitting(true); setError('')
    try {
      const data = await createCheckout({ items: cart.items.map(item => ({ productId: item._id, quantity: item.quantity, size: item.size, color: item.color })), delivery })
      window.location.assign(data.paymentUrl)
    } catch (requestError) {
      if (requestError.status === 401) window.location.assign(clientAuthUrl('login', '/cart'))
      else setError(requestError.message)
    } finally { setSubmitting(false) }
  }

  return <div className="royalCart royalShell">
    <header className="royalCartHead"><div><p>ATP Royal / Your order</p><h1>The<br/>club bag.</h1></div><div><strong>{String(cart.count).padStart(2, '0')}</strong><span>{cart.count === 1 ? 'piece selected' : 'pieces selected'}</span><Link to="/catalog"><Icon icon="solar:arrow-left-linear" /> Continue shopping</Link></div></header>
    {!cart.items.length ? <section className="royalEmptyCart"><Icon icon="solar:bag-cross-linear" /><p>YOUR ATP ROYAL BAG</p><h2>Ready for a first piece?</h2><span>Browse the collection and build your club kit.</span><Link className="royalButton" to="/catalog">Shop the collection <Icon icon="solar:arrow-right-linear" /></Link></section> : <div className="royalCartLayout">
      <section className="royalCartItems"><header><h2>Bag manifest</h2><span>{cart.count} {cart.count === 1 ? 'item' : 'items'}</span></header>{cart.items.map((item, index) => { const key = cart.keyFor(item); return <article key={key}><span className="royalCartIndex">{String(index + 1).padStart(2, '0')}</span><img src={productImage(item.image, item.category)} onError={event => recoverProductImage(event, item.category)} alt={item.name} /><div className="royalCartItemInfo"><small>ATP Royal / {item.size || item.color ? [item.color, item.size].filter(Boolean).join(' / ') : 'Club issue'}</small><h3><Link to={`/product/${item.slug}`}>{item.name}</Link></h3><strong>{money(item.price)}</strong><div className="royalCartActions"><div><button aria-label={`Reduce ${item.name} quantity`} onClick={() => item.quantity === 1 ? cart.remove(key) : cart.update(key, item.quantity - 1)}>−</button><span>{item.quantity}</span><button aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= item.stock} onClick={() => cart.update(key, item.quantity + 1)}>+</button></div><button onClick={() => cart.remove(key)}>Remove</button></div></div><div className="royalLineTotal"><small>Line total</small><strong>{money(item.price * item.quantity)}</strong></div></article>})}</section>
      <aside className="royalCheckout"><form onSubmit={checkout}><header><span>Checkout ticket</span><Icon icon="solar:shield-check-linear" /></header><div className="royalCheckoutTotal"><small>Order total</small><h2>{money(cart.total)}</h2><p>Delivery is confirmed by the ATP team after checkout.</p></div>{!user ? <div className="royalAuthGate"><p>PLAYER ACCOUNT REQUIRED</p><h3>Sign in to checkout.</h3><span>Your ATP account connects payment, delivery and order tracking.</span><a className="royalButton" href={clientAuthUrl('login', '/cart')}>Sign in to continue <Icon icon="solar:arrow-right-linear" /></a><a href={clientAuthUrl('signup', '/cart')}>New player? Create an ATP account</a></div> : <div className="royalDelivery"><p>DELIVERY DETAILS</p><label>Full name<input required value={delivery.name} onChange={event => setDelivery({ ...delivery, name: event.target.value })} /></label><label>Phone number<input required type="tel" value={delivery.phone} onChange={event => setDelivery({ ...delivery, phone: event.target.value })} /></label><label>Delivery address<textarea required value={delivery.address} onChange={event => setDelivery({ ...delivery, address: event.target.value })} /></label>{error && <p className="royalCheckoutError">{error}</p>}<button className="royalPayButton" disabled={submitting}>{submitting ? 'Opening Paystack…' : 'Pay securely'}<Icon icon="solar:arrow-right-up-linear" /></button><small>Powered and protected by Paystack.</small></div>}</form></aside>
    </div>}
  </div>
}
