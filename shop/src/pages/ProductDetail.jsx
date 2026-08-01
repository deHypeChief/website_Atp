import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProduct } from '../lib/api'
import { money } from '../lib/config'
import { productImage, recoverProductImage } from '../lib/productImages'
import { useCart } from '../store/cart'
import { useStoreData } from '../store/data'

export default function ProductDetail() {
  const { slug } = useParams()
  const { products } = useStoreData()
  const cart = useCart()
  const [fetched, setFetched] = useState({ slug: '', product: null, error: '', loading: false })
  const [image, setImage] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cached = products.find(item => item.slug === slug)
    if (cached) return
    let active = true
    Promise.resolve().then(() => { if (active) setFetched({ slug, product: null, error: '', loading: true }) })
    getProduct(slug).then(product => { if (active) setFetched({ slug, product, error: '', loading: false }) }).catch(requestError => { if (active) setFetched({ slug, product: null, error: requestError.message, loading: false }) })
    return () => { active = false }
  }, [slug, products])

  const product = products.find(item => item.slug === slug) || (fetched.slug === slug ? fetched.product : null)
  const loading = !product && (fetched.slug !== slug || fetched.loading)
  const error = fetched.slug === slug ? fetched.error : ''

  if (loading) return <div className="RoyalePageState">Loading the piece…</div>
  if (error || !product) return <div className="RoyalePageState"><Icon icon="solar:bag-cross-linear" /><h1>Piece not found.</h1><p>{error || 'This product is no longer in the active collection.'}</p><Link to="/catalog">Return to the collection</Link></div>

  const images = product.images?.length ? product.images : ['']
  const related = products.filter(item => item._id !== product._id && item.category === product.category).slice(0, 3)
  const selectedKey = cart.keyFor({ _id: product._id, size, color })
  const selectedLine = cart.items.find(item => cart.keyFor(item) === selectedKey)
  const quantity = selectedLine?.quantity || 0
  const add = () => {
    if (product.sizes?.length && !size) { setMessage('Choose your size before adding this piece.'); return }
    if (product.colors?.length && !color) { setMessage('Choose your colour before adding this piece.'); return }
    if (quantity >= product.stock) { setMessage(`All ${product.stock} available pieces are already in your bag.`); return }
    cart.add(product, { size, color }); setMessage('Added to your ATP ROYALE bag.')
  }
  const decrease = () => {
    if (!selectedLine) return
    if (quantity === 1) { cart.remove(selectedKey); setMessage('Removed from your ATP ROYALE bag.'); return }
    cart.update(selectedKey, quantity - 1); setMessage('Bag quantity updated.')
  }

  return <div className="RoyaleProductPage">
    <nav className="RoyaleBreadcrumb"><Link to="/catalog">Collection</Link><Icon icon="solar:alt-arrow-right-linear" /><span>{product.name}</span></nav>
    <section className="RoyaleProductDetail">
      <div className="RoyaleGallery">
        <div className="RoyaleMainImage"><img src={productImage(images[image], product.category)} onError={event => recoverProductImage(event, product.category)} alt={product.name} /><small>{product.badge || product.collection || 'Club issue'}</small></div>
        {images.length > 1 && <div className="RoyaleThumbs">{images.map((item, index) => <button className={image === index ? 'active' : ''} onClick={() => setImage(index)} key={`${item}-${index}`} aria-label={`View image ${index + 1}`}><img src={productImage(item, product.category)} onError={event => recoverProductImage(event, product.category)} alt="" /></button>)}</div>}
      </div>
      <div className="RoyaleProductCopy">
        <p>{product.category} / {product.collection || 'ATP ROYALE'}</p>
        <h1>{product.name}</h1>
        <div className="RoyaleDetailPrice"><strong>{money(product.price)}</strong>{product.compareAtPrice > product.price && <del>{money(product.compareAtPrice)}</del>}</div>
        <span className="RoyaleStock"><i className={product.stock ? '' : 'sold'} />{product.stock ? `${product.stock} ready to dispatch` : 'Currently sold out'}</span>
        <p className="RoyaleDescription">{product.description}</p>
        {product.colors?.length > 0 && <fieldset className="RoyaleOptions"><legend>Colour <span>{color || 'Select one'}</span></legend><div>{product.colors.map(value => <button type="button" className={color === value ? 'active' : ''} key={value} onClick={() => { setColor(value); setMessage('') }}>{value}</button>)}</div></fieldset>}
        {product.sizes?.length > 0 && <fieldset className="RoyaleOptions RoyaleSizes"><legend>Size <span>{size || 'Select one'}</span></legend><div>{product.sizes.map(value => <button type="button" className={size === value ? 'active' : ''} key={value} onClick={() => { setSize(value); setMessage('') }}>{value}</button>)}</div></fieldset>}
        {message && <p className="RoyaleAddMessage" aria-live="polite">{message}</p>}
        <div className="RoyaleQuantityControl" aria-label={`${product.name} quantity in bag`}>
          <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={!quantity} onClick={decrease}>−</button>
          <span><small>{product.stock ? 'Quantity in bag' : 'Sold out'}</small><strong>{String(quantity).padStart(2, '0')}</strong></span>
          <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={!product.stock || quantity >= product.stock} onClick={add}>+</button>
        </div>
        <div className="RoyaleProductService"><div><Icon icon="solar:delivery-linear" /><span><strong>Nationwide delivery</strong>Tracked from ATP to your door.</span></div><div><Icon icon="solar:shield-check-linear" /><span><strong>Secure payment</strong>Protected checkout with Paystack.</span></div><div><Icon icon="solar:user-check-rounded-linear" /><span><strong>Player account</strong>Order updates live in your ATP dashboard.</span></div></div>
      </div>
    </section>
    {related.length > 0 && <section className="RoyaleRelated RoyaleShell"><header className="RoyaleSectionHeader"><div><p>Complete the kit</p><h2>Same court code.</h2></div><Link to={`/catalog?category=${encodeURIComponent(product.category)}`}>See {product.category} <Icon icon="solar:arrow-right-linear" /></Link></header><div className="RoyaleProductGrid">{related.map((item, index) => <ProductCard key={item._id} product={item} index={index} />)}</div></section>}
  </div>
}
