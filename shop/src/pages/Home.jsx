import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStoreData } from '../store/data'
import heroPlayer from '../assets/brand/hero-player.png'
import apparelImage from '../assets/brand/apparel.png'
import equipmentImage from '../assets/brand/equipment.png'
import accessoriesImage from '../assets/brand/accessories.png'
import communityImage from '../assets/brand/community.png'

const categories = [
  { name: 'Apparel', note: 'Training layers / club pieces', image: apparelImage, to: '/catalog?category=Apparel' },
  { name: 'Equipment', note: 'Match-ready / court tested', image: equipmentImage, to: '/catalog?category=Equipment' },
  { name: 'Accessories', note: 'Finishing kit / daily carry', image: accessoriesImage, to: '/catalog?category=Accessories' },
]

export default function Home() {
  const { products, settings, loading, error, reload } = useStoreData()
  const [joined, setJoined] = useState(false)
  const featured = products.filter(product => product.featured).slice(0, 4)
  const drop = featured.length ? featured : products.slice(0, 4)
  const heroImage = settings.heroImage || heroPlayer

  return <div className="royalHome">
    <section className="royalHero">
      <img src={heroImage} alt="ATP player wearing the club collection" />
      <span className="royalHeroWash" />
      <div className="royalHeroCopy">
        <p>{settings.heroEyebrow}</p>
        <h1>{settings.heroTitle}</h1>
        <span>{settings.heroSubtitle}</span>
        <div><Link className="royalButton royalButtonLight" to="/catalog">{settings.primaryCta} <Icon icon="solar:arrow-right-linear" /></Link><Link className="royalTextLink" to="/catalog?category=Equipment">{settings.secondaryCta} <Icon icon="solar:arrow-right-up-linear" /></Link></div>
      </div>
      <div className="royalDropBoard"><small>THE CLUB STANDARD</small><strong>ROYAL</strong><span>Made for court days<br/>and everything after.</span></div>
      <a className="royalScrollCue" href="#fresh-drop"><span>Scroll to shop</span><Icon icon="solar:arrow-down-linear" /></a>
    </section>

    <section className="royalTicker" aria-label="ATP Royal promises"><span>ATP CLUB ISSUE</span><i /> <span>SECURE PAYSTACK CHECKOUT</span><i /> <span>NATIONWIDE DELIVERY</span><i /> <span>PLAYER ACCOUNT ORDER TRACKING</span></section>

    <section className="royalFresh royalShell" id="fresh-drop">
      <header className="royalSectionHeader"><div><p>Fresh from the locker</p><h2>New club issue.</h2></div><Link to="/catalog">View all products <Icon icon="solar:arrow-right-up-linear" /></Link></header>
      {loading ? <LoadingGrid /> : error ? <ErrorState message={error} retry={reload} /> : drop.length ? <div className="royalProductGrid">{drop.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div> : <EmptyProducts />}
    </section>

    <section className="royalCategoryStory royalShell">
      <header className="royalSectionHeader"><div><p>Build your kit</p><h2>Shop by position.</h2></div><span>Three routes into the ATP Royal collection.</span></header>
      <div className="royalCategoryGrid">{categories.map((category, index) => <Link key={category.name} to={category.to} className="royalCategoryCard"><img src={category.image} alt="" /><span className="royalCategoryShade" /><div><small>{category.note}</small><h3>{category.name}</h3><span>Explore collection <Icon icon="solar:arrow-right-up-linear" /></span></div><b>{String(index + 1).padStart(2, '0')}</b></Link>)}</div>
    </section>

    <section className="royalManifesto">
      <div className="royalManifestoCopy"><p>ATP ROYAL / CLUB CULTURE</p><h2>Not merch.<br/>A uniform for<br/>the tennis life.</h2><span>Built around the rhythm of Lagos courts—early drills, hard matches, long conversations after the final point.</span><Link className="royalButton" to="/catalog">Wear the standard <Icon icon="solar:arrow-right-linear" /></Link></div>
      <div className="royalManifestoImage"><img src={communityImage} alt="ATP players together after a match" /><div><strong>PLAY</strong><span>TRAIN · BELONG · REPEAT</span></div></div>
    </section>

    <section className="royalServiceStrip royalShell">
      <Service icon="solar:delivery-linear" title="Local delivery" text={settings.deliveryNote} />
      <Service icon="solar:refresh-circle-linear" title="Easy exchanges" text={settings.returnsNote} />
      <Service icon="solar:shield-check-linear" title="Secure checkout" text="Paystack protects every ATP Royal payment." />
    </section>

    <section className="royalMailing">
      <div><p>ROYAL DISPATCH</p><h2>The next drop,<br/>before everyone else.</h2></div>
      <form onSubmit={event => { event.preventDefault(); setJoined(true) }}><label htmlFor="royal-email">Collection notes and restock alerts. No noise.</label><div><input id="royal-email" type="email" placeholder="Your email address" required /><button aria-label="Join the Royal Dispatch"><Icon icon="solar:plain-2-linear" /></button></div>{joined && <p>You’re on the list.</p>}</form>
    </section>
  </div>
}

function Service({ icon, title, text }) { return <article><Icon icon={icon} /><div><h3>{title}</h3><p>{text}</p></div></article> }
function LoadingGrid() { return <div className="royalProductGrid royalLoadingGrid">{[0, 1, 2, 3].map(item => <i key={item} />)}</div> }
function ErrorState({ message, retry }) { return <div className="royalState"><Icon icon="solar:danger-triangle-linear" /><h3>The locker is temporarily closed.</h3><p>{message}</p><button onClick={retry}>Try again</button></div> }
function EmptyProducts() { return <div className="royalState"><Icon icon="solar:bag-cross-linear" /><h3>The first drop is being prepared.</h3><p>Products added in the ATP admin will appear here automatically.</p></div> }
