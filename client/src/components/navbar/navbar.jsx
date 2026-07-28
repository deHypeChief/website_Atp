import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../libs/images/logoColor.svg";
import { useAuth } from "../../libs/hooks/use-auth";
import { shopHref } from "../../libs/shop";
import "./style-v2.css";

const links = [
  { name: "Home", to: "/" },
  { name: "Training", to: "/coaching" },
  { name: "Tournaments", to: "/tournaments" },
  { name: "News", to: "/news" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const currentUser = user();
  const location = useLocation();
  useEffect(() => { const scroll = () => setScrolled(window.scrollY > 30); scroll(); window.addEventListener("scroll", scroll, { passive: true }); return () => window.removeEventListener("scroll", scroll); }, []);
  useEffect(() => setOpen(false), [location.pathname]);
  if (location.pathname === "/u" || location.pathname.startsWith("/u/")) return null;
  const name = currentUser?.fullName?.split(" ")[0] || currentUser?.username || "Player";

  return <header className={`navV2 ${scrolled || location.pathname !== "/" ? "solid" : ""} ${open ? "menuOpen" : ""}`}>
    <nav>
      <Link className="navBrand" to="/"><img src={logo} alt="ATP International" /></Link>
      <div className="navLinks">{links.map(link => <NavLink key={link.to} to={link.to}>{link.name}</NavLink>)}<a href={shopHref('/catalog')}>Shop</a></div>
      <div className="navTools">
        <a className="navCart" href={shopHref('/cart')} aria-label="Open ATP Royal bag"><Icon icon="solar:bag-3-linear" /></a>
        {currentUser ? <Link className="navAccount" to="/u"><span>{currentUser.picture ? <img src={currentUser.picture} alt="" /> : name.charAt(0)}</span>{name}</Link> : <Link className="navJoin" to="/signup">Join ATP <Icon icon="solar:arrow-right-up-linear" /></Link>}
        <button className="navMenuButton" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><Icon icon={open ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} /></button>
      </div>
    </nav>
    {open && <div className="navMobile">{links.map((link, index) => <NavLink key={link.to} to={link.to}><span>{String(index + 1).padStart(2, "0")}</span>{link.name}<Icon icon="solar:arrow-right-linear" /></NavLink>)}<a href={shopHref('/catalog')}><span>{String(links.length + 1).padStart(2, "0")}</span>ATP Royal<Icon icon="solar:arrow-right-up-linear" /></a><div>{currentUser ? <Link to="/u">Open player dashboard</Link> : <><Link to="/login">Sign in</Link><Link to="/signup">Create account</Link></>}</div></div>}
  </header>;
}
