/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { SHOP_URL, shopHref } from '../../libs/shop'
import './style.css'

const PROMPT_KEY = 'atp-royal-prompt-v1'
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000

export default function StorePromo({ placement = 'landing' }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(PROMPT_KEY) || 0)
    if (Date.now() - lastSeen < TWO_WEEKS) return
    const timer = window.setTimeout(() => setDialogOpen(true), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!dialogOpen) return
    const closeOnEscape = event => { if (event.key === 'Escape') dismiss() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dialogOpen])

  const dismiss = () => { localStorage.setItem(PROMPT_KEY, String(Date.now())); setDialogOpen(false) }
  const visit = () => { localStorage.setItem(PROMPT_KEY, String(Date.now())); window.location.assign(SHOP_URL) }

  return <>
    <aside className={`atpRoyalBanner ${placement}`} aria-label="ATP Royal store">
      <div className="atpRoyalMark"><span>ATP</span><strong>ROYAL</strong></div>
      <div><small>THE OFFICIAL ATP CLUB STORE</small><h2>Meet the new club standard.</h2><p>Court apparel, match equipment and daily ATP essentials—now in one dedicated store.</p></div>
      <a href={shopHref('/catalog')}>Visit ATP Royal <Icon icon="solar:arrow-right-up-linear" /></a>
      <span className="atpRoyalCourtLine" />
    </aside>
    {dialogOpen && <div className="atpRoyalDialogScrim" onMouseDown={event => { if (event.target === event.currentTarget) dismiss() }}><section className="atpRoyalDialog" role="dialog" aria-modal="true" aria-labelledby="atp-royal-title">
      <button className="atpRoyalDialogClose" onClick={dismiss} aria-label="Close ATP Royal message"><Icon icon="solar:close-circle-linear" /></button>
      <div className="atpRoyalDialogLabel"><span>ATP</span><strong>ROYAL</strong></div>
      <p>NEW FROM ATP INTERNATIONAL</p>
      <h2 id="atp-royal-title">Your club store<br/>has a new home.</h2>
      <span>Discover ATP Royal for court-ready apparel, equipment and members’ essentials. Your existing ATP account works there too.</span>
      <div><button onClick={visit}>Visit ATP Royal <Icon icon="solar:arrow-right-up-linear" /></button><button onClick={dismiss}>Maybe later</button></div>
    </section></div>}
  </>
}
