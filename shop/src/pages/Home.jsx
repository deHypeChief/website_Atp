import { useEffect, useState } from 'react'
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
  const [activeSlide, setActiveSlide] = useState(0)
  const [carouselFocused, setCarouselFocused] = useState(false)
  const featured = products.filter(product => product.featured).slice(0, 4)
  const drop = featured.length ? featured : products.slice(0, 4)
  const heroImage = settings.heroImage || heroPlayer
  const slides = [
    { image: heroImage, position: 'center 24%', alt: 'ATP player wearing the club collection', eyebrow: settings.heroEyebrow, title: settings.heroTitle, subtitle: settings.heroSubtitle, primaryCta: settings.primaryCta, primaryTo: '/catalog', secondaryCta: settings.secondaryCta, secondaryTo: '/catalog?category=Equipment', boardLabel: 'The club standard', boardTitle: 'ATP ROYALE', boardNote: <>Made for court days<br/>and everything after.</> },
    { image: apparelImage, position: 'center 34%', alt: 'ATP player serving in navy court apparel', eyebrow: 'ATP ROYALE / COURT UNIFORM', title: 'Move in club colours.', subtitle: 'Breathable layers built for first serves, long rallies and the work between matches.', primaryCta: 'Shop apparel', primaryTo: '/catalog?category=Apparel', secondaryCta: 'See the full drop', secondaryTo: '/catalog', boardLabel: 'The court uniform', boardTitle: 'Move', boardNote: <>Cut for match speed<br/>and training rhythm.</> },
    { image: equipmentImage, position: 'center center', alt: 'ATP coach and young players training with court equipment', eyebrow: 'ATP ROYALE / MATCH DAY', title: 'Ready for every rally.', subtitle: 'Court-tested equipment and daily essentials for practice, match day and the next generation.', primaryCta: 'Shop equipment', primaryTo: '/catalog?category=Equipment', secondaryCta: 'Build your kit', secondaryTo: '/catalog?category=Accessories', boardLabel: 'The match kit', boardTitle: 'Ready', boardNote: <>Everything the next point<br/>asks you to bring.</> },
  ]
  const slide = slides[activeSlide]

  useEffect(() => {
    if (carouselFocused) return undefined
    const timer = window.setTimeout(() => setActiveSlide(current => (current + 1) % slides.length), 6500)
    return () => window.clearTimeout(timer)
  }, [activeSlide, carouselFocused, slides.length])

  return <div className="RoyaleHome">
    <section className="RoyaleHero" aria-roledescription="carousel" aria-label="ATP ROYALE featured collections" onMouseEnter={() => setCarouselFocused(true)} onMouseLeave={() => setCarouselFocused(false)} onFocus={() => setCarouselFocused(true)} onBlur={() => setCarouselFocused(false)}>
      {slides.map((item, index) => <img className={`RoyaleHeroImage ${activeSlide === index ? 'active' : ''}`} style={{ objectPosition: item.position }} src={item.image} alt={activeSlide === index ? item.alt : ''} aria-hidden={activeSlide !== index} key={`${item.title}-${index}`} />)}
      <span className="RoyaleHeroWash" />
      <div className="RoyaleHeroCopy" role="group" aria-roledescription="slide" aria-label={`${activeSlide + 1} of ${slides.length}`} key={`hero-copy-${activeSlide}`}>
        <p>{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <span>{slide.subtitle}</span>
        <div><Link className="RoyaleButton RoyaleButtonLight" to={slide.primaryTo}>{slide.primaryCta} <Icon icon="solar:arrow-right-linear" /></Link><Link className="RoyaleTextLink" to={slide.secondaryTo}>{slide.secondaryCta} <Icon icon="solar:arrow-right-up-linear" /></Link></div>
      </div>
      <div className="RoyaleDropBoard" key={`hero-board-${activeSlide}`}><small>{slide.boardLabel}</small><strong>{slide.boardTitle}</strong><span>{slide.boardNote}</span></div>
      <div className={`RoyaleHeroControls ${carouselFocused ? 'paused' : ''}`} aria-label="Choose a featured collection">
        <div className="RoyaleHeroDots">{slides.map((item, index) => <button type="button" className={activeSlide === index ? 'active' : ''} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={activeSlide === index ? 'true' : undefined} onClick={() => setActiveSlide(index)} key={item.title} />)}</div>
      </div>
      <a className="RoyaleScrollCue" href="#fresh-drop"><span>Scroll to shop</span><Icon icon="solar:arrow-down-linear" /></a>
    </section>

    <section className="RoyaleTicker" aria-label="ATP ROYALE promises"><span>ATP CLUB ISSUE</span><i /> <span>SECURE PAYSTACK CHECKOUT</span><i /> <span>NATIONWIDE DELIVERY</span><i /> <span>PLAYER ACCOUNT ORDER TRACKING</span></section>

    <section className="RoyaleFresh RoyaleShell" id="fresh-drop">
      <header className="RoyaleSectionHeader"><div><p>Fresh from the locker</p><h2>New club issue.</h2></div><Link to="/catalog">View all products <Icon icon="solar:arrow-right-up-linear" /></Link></header>
      {loading ? <LoadingGrid /> : error ? <ErrorState message={error} retry={reload} /> : drop.length ? <div className="RoyaleProductGrid">{drop.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div> : <EmptyProducts />}
    </section>

    <section className="RoyaleCategoryStory RoyaleShell">
      <header className="RoyaleSectionHeader"><div><p>Build your kit</p><h2>Shop by position.</h2></div><span>Three routes into the ATP ROYALE collection.</span></header>
      <div className="RoyaleCategoryGrid">{categories.map((category, index) => <Link key={category.name} to={category.to} className="RoyaleCategoryCard"><img src={category.image} alt="" /><span className="RoyaleCategoryShade" /><div><small>{category.note}</small><h3>{category.name}</h3><span>Explore collection <Icon icon="solar:arrow-right-up-linear" /></span></div><b>{String(index + 1).padStart(2, '0')}</b></Link>)}</div>
    </section>

    <section className="RoyaleManifesto">
      <div className="RoyaleManifestoCopy"><p>ATP ROYALE / CLUB CULTURE</p><h2>Not merch.<br/>A uniform for<br/>the tennis life.</h2><span>Built around the rhythm of Abuja courts—early drills, hard matches, long conversations after the final point.</span><Link className="RoyaleButton" to="/catalog">Wear the standard <Icon icon="solar:arrow-right-linear" /></Link></div>
      <div className="RoyaleManifestoImage"><img src={communityImage} alt="ATP players together after a match" /><div><strong>PLAY</strong><span>TRAIN · BELONG · REPEAT</span></div></div>
    </section>

    <section className="RoyaleServiceStrip RoyaleShell">
      <Service icon="solar:delivery-linear" title="Local delivery" text={settings.deliveryNote} />
      <Service icon="solar:refresh-circle-linear" title="Easy exchanges" text={settings.returnsNote} />
      <Service icon="solar:shield-check-linear" title="Secure checkout" text="Paystack protects every ATP ROYALE payment." />
    </section>

    <section className="RoyaleMailing">
      <div><p>Royale DISPATCH</p><h2>The next drop,<br/>before everyone else.</h2></div>
      <form onSubmit={event => { event.preventDefault(); setJoined(true) }}><label htmlFor="Royale-email">Collection notes and restock alerts. No noise.</label><div><input id="Royale-email" type="email" placeholder="Your email address" required /><button aria-label="Join the Royale Dispatch"><Icon icon="solar:plain-2-linear" /></button></div>{joined && <p>You’re on the list.</p>}</form>
    </section>
  </div>
}

function Service({ icon, title, text }) { return <article><Icon icon={icon} /><div><h3>{title}</h3><p>{text}</p></div></article> }
function LoadingGrid() { return <div className="RoyaleProductGrid RoyaleLoadingGrid">{[0, 1, 2, 3].map(item => <i key={item} />)}</div> }
function ErrorState({ message, retry }) { return <div className="RoyaleState"><Icon icon="solar:danger-triangle-linear" /><h3>The locker is temporarily closed.</h3><p>{message}</p><button onClick={retry}>Try again</button></div> }
function EmptyProducts() { return <div className="RoyaleState"><Icon icon="solar:bag-cross-linear" /><h3>The first drop is being prepared.</h3><p>Products added in the ATP admin will appear here automatically.</p></div> }
