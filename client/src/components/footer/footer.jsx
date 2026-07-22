import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../libs/images/logo.svg";
import "./style-v2.css";

const groups = [
  { title: "Play", links: [["Training", "/coaching"], ["Tournaments", "/tournaments"], ["Membership", "/membership/adult"], ["Community", "/community"]] },
  { title: "Explore", links: [["About ATP", "/about"], ["News", "/news"], ["Shop", "/shop"], ["Contact", "/contact"]] },
  { title: "Player", links: [["Dashboard", "/u"], ["My coach", "/u/coach"], ["Tickets", "/u/tickets"], ["Orders", "/u/orders"]] },
];

export default function Footer() {
  return <footer className="footerV2">
    <div className="footerLead">
      <div><img src={logo} alt="ATP International"/><p>Train. Compete.<br/>Belong.</p></div>
      <h2>Your court<br/>is waiting.</h2>
      <Link to="/signup">Join ATP <Icon icon="solar:arrow-right-up-linear"/></Link>
    </div>
    <div className="footerLinks">
      {groups.map(group => <div key={group.title}><h3>{group.title}</h3>{group.links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</div>)}
      <div><h3>Follow</h3><a href="https://www.instagram.com/amateurtennispro">Instagram</a><a href="https://www.facebook.com">Facebook</a><a href="https://youtube.com/@afropowerent">YouTube</a></div>
    </div>
    <div className="footerBottom"><span>© {new Date().getFullYear()} Amateur Tennis Pro</span><span>Lagos, Nigeria</span><div><Link to="/">Privacy</Link><Link to="/">Terms</Link></div></div>
  </footer>;
}
