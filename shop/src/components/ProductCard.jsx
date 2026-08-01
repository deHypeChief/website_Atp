import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { money } from '../lib/config'
import { productImage, recoverProductImage } from '../lib/productImages'
import { useCart } from '../store/cart'

export default function ProductCard({ product, index = 0 }) {
  const cart = useCart()
  const hasOptions = Boolean(product.sizes?.length || product.colors?.length)
  const line = hasOptions ? null : cart.items.find(item => item._id === product._id && !item.size && !item.color)
  const quantity = line?.quantity || 0
  const key = line ? cart.keyFor(line) : ''
  const increase = () => { if (quantity < product.stock) cart.add(product) }
  const decrease = () => {
    if (!line) return
    if (quantity === 1) cart.remove(key)
    else cart.update(key, quantity - 1)
  }
  return <article className="RoyaleProductCard" style={{ '--card-delay': `${Math.min(index, 5) * 55}ms` }}>
    <Link className="RoyaleProductVisual" to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
      <img src={productImage(product.images?.[0], product.category)} onError={event => recoverProductImage(event, product.category)} alt={product.name} loading="lazy" />
      <span className="RoyaleProductBadge">{product.badge || (product.stock ? 'Club issue' : 'Sold out')}</span>
      <span className="RoyaleProductView">View piece <Icon icon="solar:arrow-right-up-linear" /></span>
    </Link>
    <div className="RoyaleProductMeta">
      <div><small>{product.category || 'ATP ROYALE'}</small><h3><Link to={`/product/${product.slug}`}>{product.name}</Link></h3></div>
      <div className="RoyaleProductPrice"><strong>{money(product.price)}</strong>{product.compareAtPrice > product.price && <del>{money(product.compareAtPrice)}</del>}</div>
      {hasOptions ? <Link className="RoyaleQuickAction" to={`/product/${product.slug}`}>Choose options <Icon icon="solar:arrow-right-linear" /></Link> : <div className="RoyaleCardStepper" aria-label={`${product.name} quantity in bag`}><button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={!quantity} onClick={decrease}>−</button><span><small>{product.stock ? 'In bag' : 'Sold out'}</small><b>{quantity}</b></span><button type="button" aria-label={`Increase ${product.name} quantity`} disabled={!product.stock || quantity >= product.stock} onClick={increase}>+</button></div>}
    </div>
  </article>
}
