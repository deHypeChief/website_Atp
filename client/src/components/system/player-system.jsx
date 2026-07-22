/* eslint-disable react/prop-types */
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export function PlayerPageHeader({eyebrow,title,text,action}){return <header className="playerPageHeader"><div><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</header>}
export function PlayerEmpty({icon="solar:inbox-linear",title,text,to,label}){return <div className="playerEmpty"><Icon icon={icon}/><h2>{title}</h2><p>{text}</p>{to&&<Link to={to}>{label}<Icon icon="solar:arrow-right-linear"/></Link>}</div>}
export function PlayerLoading({text="Preparing your player desk…"}){return <div className="playerLoading"><i/><span>{text}</span></div>}
export function PlayerMetric({icon,label,value}){return <article className="playerMetric"><Icon icon={icon}/><small>{label}</small><strong>{value}</strong></article>}
