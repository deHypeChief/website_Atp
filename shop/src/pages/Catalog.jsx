import { useEffect, useMemo, useRef } from 'react'
import { Icon } from '@iconify/react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStoreData } from '../store/data'

export default function Catalog() {
  const { products, loading, error, reload } = useStoreData()
  const [params, setParams] = useSearchParams()
  const searchRef = useRef(null)
  const query = params.get('q') || ''
  const category = params.get('category') || 'All'
  const sort = params.get('sort') || 'newest'
  const inStock = params.get('stock') === 'true'
  const categories = ['All', ...new Set(products.map(product => product.category === 'Bags' ? 'Accessories' : product.category).filter(Boolean))]

  useEffect(() => { if (params.get('focus') === 'search') searchRef.current?.focus() }, [params])
  const update = (name, value) => { const next = new URLSearchParams(params); value && value !== 'All' ? next.set(name, value) : next.delete(name); next.delete('focus'); setParams(next, { replace: true }) }
  const visible = useMemo(() => {
    const match = products.filter(product => {
      const haystack = `${product.name} ${product.description} ${product.category} ${product.collection}`.toLowerCase()
      const categoryMatch = category === 'All' || product.category === category || (category === 'Accessories' && product.category === 'Bags')
      return (!query || haystack.includes(query.toLowerCase())) && categoryMatch && (!inStock || product.stock > 0)
    })
    return [...match].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [products, query, category, sort, inStock])

  return <div className="royalCatalog royalShell">
    <header className="royalCatalogHead"><p>ATP Royal / The full collection</p><h1>Find your<br/>court code.</h1><span>Search ATP Royal products, compare prices and filter the collection around how you play.</span></header>
    <section className="royalCatalogControls">
      <label className="royalSearch"><Icon icon="solar:magnifer-linear" /><input ref={searchRef} value={query} onChange={event => update('q', event.target.value)} placeholder="Search products and prices" /><span>{visible.length} results</span></label>
      <div className="royalFilterRow"><div className="royalCategoryPills">{categories.map(value => <button key={value} className={category === value ? 'active' : ''} onClick={() => update('category', value)}>{value}</button>)}</div><label className="royalStockToggle"><input type="checkbox" checked={inStock} onChange={event => update('stock', event.target.checked ? 'true' : '')} />In stock only</label><label className="royalSort">Sort<select value={sort} onChange={event => update('sort', event.target.value)}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label></div>
    </section>
    {loading ? <div className="royalProductGrid royalLoadingGrid">{[0,1,2,3,4,5,6,7].map(item => <i key={item} />)}</div> : error ? <div className="royalState"><h2>Products are unavailable.</h2><p>{error}</p><button onClick={reload}>Try again</button></div> : visible.length ? <div className="royalProductGrid royalCatalogGrid">{visible.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div> : <div className="royalState"><Icon icon="solar:magnifer-linear" /><h2>No pieces match that search.</h2><p>Try a shorter product name or reset the filters.</p><button onClick={() => setParams({})}>Clear filters</button></div>}
  </div>
}
