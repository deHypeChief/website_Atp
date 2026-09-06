import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import crest from '../assets/brand/atp-royale-crest.jpg'
import { clientAuthUrl, signOut } from '../lib/auth'
import { CLIENT_URL } from '../lib/config'
import { getUser } from '../lib/api'
import { useCart } from '../store/cart'
import { useStoreData } from '../store/data'

const categories = [
  ['New drop', '/catalog?sort=newest'],
  ['Apparel', '/catalog?category=Apparel'],
  ['Equipment', '/catalog?category=Equipment'],
  ['Accessories', '/catalog?category=Accessories'],
]

export default function StoreLayout() {
  const location = useLocation()
  const { settings } = useStoreData()
  const cart = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getUser)
  const isCurrentCategory = to => {
    if (location.pathname !== '/catalog') return false
    const target = new URLSearchParams(to.split('?')[1] || '')
    const current = new URLSearchParams(location.search)
    if (target.has('category')) return current.get('category') === target.get('category')
    if (target.has('sort')) return current.get('sort') === target.get('sort')
    return false
  }
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname, location.search])
  useEffect(() => { const sync = () => setUser(getUser()); window.addEventListener('atp-auth-change', sync); return () => window.removeEventListener('atp-auth-change', sync) }, [])

  return <div className="RoyaleApp">
    <a className="skipLink" href="#Royale-main">Skip to products</a>
    <header className="RoyaleHeader">
      <nav aria-label="Main navigation">
        <button className="RoyaleMenuButton" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}><Icon aria-hidden="true" icon={menuOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'} /></button>
        <div className="RoyaleCategoryNav">{categories.map(([label, to]) => <Link className={isCurrentCategory(to) ? 'active' : undefined} aria-current={isCurrentCategory(to) ? 'page' : undefined} key={label} to={to}>{label}</Link>)}</div>
        <Link className="RoyaleBrand" to="/" aria-label="ATP ROYALE home"><img src={crest} alt="" /><span><strong>ATP ROYALE</strong><small>OFFICIAL CLUB STORE</small></span></Link>
        <div className="RoyaleTools">
          <a className="RoyaleBackHome" href={CLIENT_URL} aria-label="Back to the ATP International website"><Icon icon="solar:arrow-left-linear" /><b>ATP</b></a>
          <Link className="RoyaleSearchLink" to="/catalog?focus=search" aria-label="Search products"><Icon icon="solar:magnifer-linear" /><span>Search</span></Link>
          {user ? <div className="RoyaleAccount"><a href={`${CLIENT_URL}/u`}>{(user.fullName || user.username || 'Player').split(' ')[0]}</a><button onClick={signOut}>Sign out</button></div> : <Link to={clientAuthUrl('login', `${location.pathname}${location.search}`)} aria-label="Sign in"><Icon icon="solar:user-rounded-linear" /><span>Sign in</span></Link>}
          <Link className="RoyaleBag" to="/cart" aria-label={`Bag with ${cart.count} items`}><Icon icon="solar:bag-3-linear" /><span>Bag</span><b>{cart.count}</b></Link>
        </div>
      </nav>
      {menuOpen && <div className="RoyaleMobileNav"><a className="RoyaleMobileBack" href={CLIENT_URL} onClick={() => setMenuOpen(false)}><Icon icon="solar:arrow-left-linear" />Back to ATP International</a>{categories.map(([label, to]) => <Link className={isCurrentCategory(to) ? 'active' : undefined} aria-current={isCurrentCategory(to) ? 'page' : undefined} key={label} to={to} onClick={() => setMenuOpen(false)}>{label}<Icon icon="solar:arrow-right-linear" /></Link>)}<Link to="/catalog?focus=search" onClick={() => setMenuOpen(false)}>Search products</Link>{user ? <a href={`${CLIENT_URL}/u`}>Player dashboard</a> : <><Link to={clientAuthUrl('login', location.pathname)}>Sign in</Link><Link to={clientAuthUrl('signup', location.pathname)}>Create ATP account</Link></>}</div>}
    </header>
    <main id="Royale-main"><Outlet /></main>
    <footer className="RoyaleFooter">
      <div className="RoyaleFooterLead"><div><img src={crest} alt="" /><span>ATP ROYALE</span></div><h2>Wear the<br/>club standard.</h2><Link to="/catalog">Shop all <Icon icon="solar:arrow-right-up-linear" /></Link></div>
      <div className="RoyaleFooterGrid">
        <div><h3>Shop</h3><Link to="/catalog">All products</Link>{categories.slice(1).map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}</div>
        <div><h3>Player service</h3><Link to="/cart">Your bag</Link><Link to="/orders">Track an order</Link><a href={`${CLIENT_URL}/contact`}>Contact ATP</a></div>
        <div><h3>ATP International</h3><a href={CLIENT_URL}>Main website</a><a href={`${CLIENT_URL}/coaching`}>Training</a><a href={`${CLIENT_URL}/tournaments`}>Tournaments</a></div>
        <div className="RoyaleFooterNotes"><h3>Club service</h3><p>{settings.deliveryNote}</p><p>{settings.returnsNote}</p></div>
      </div>
      <div className="RoyaleFooterBottom"><span>© {new Date().getFullYear()} Amateur Tennis Pro</span><span>ATP ROYALE / Abuja, Nigeria</span></div>
    </footer>
  </div>
}
