/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { openShopWithSession, SHOP_URL, shopLinkProps } from '../../libs/shop'
import crest from '../../assets/brand/atp-royale-crest.jpg'
import './style.css'

const PROMPT_KEY = 'atp-Royale-prompt-v1'
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
  const visit = () => { localStorage.setItem(PROMPT_KEY, String(Date.now())); if (!openShopWithSession('/')) window.location.assign(SHOP_URL) }

  return <>
    <aside className={`atpRoyaleBanner ${placement}`} aria-label="ATP ROYALE store">
      <div className="atpRoyaleMark"><img src={crest} alt="ATP ROYALE" /></div>
      <div><small>THE OFFICIAL ATP CLUB STORE</small><h2>Meet the new club standard.</h2><p>Court apparel, match equipment and daily ATP essentials—now in one dedicated store.</p></div>
      <a {...shopLinkProps('/catalog')}>Visit ATP ROYALE <Icon icon="solar:arrow-right-up-linear" /></a>
      <span className="atpRoyaleCourtLine" />
    </aside>
    {dialogOpen && <div className="atpRoyaleDialogScrim" onMouseDown={event => { if (event.target === event.currentTarget) dismiss() }}><section className="atpRoyaleDialog" role="dialog" aria-modal="true" aria-labelledby="atp-Royale-title">
      <button className="atpRoyaleDialogClose" onClick={dismiss} aria-label="Close ATP ROYALE message"><Icon icon="solar:close-circle-linear" /></button>
      <div className="atpRoyaleDialogLabel"><img src={crest} alt="ATP ROYALE" /></div>
      <p>NEW FROM ATP INTERNATIONAL</p>
      <h2 id="atp-Royale-title"><span>Your club</span><span>store has a</span><span>new home.</span></h2>
      <span>Discover ATP ROYALE for court-ready apparel, equipment and members’ essentials. Your existing ATP account works there too.</span>
      <div><button onClick={visit}>Visit ATP ROYALE <Icon icon="solar:arrow-right-up-linear" /></button><button onClick={dismiss}>Maybe later</button></div>
    </section></div>}
  </>
}
