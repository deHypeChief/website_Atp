/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./system.css";

export function Reveal({children,className="",delay=0,as:Tag="div"}){
  const ref=useRef(null); const [visible,setVisible]=useState(false);
  useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setVisible(true);observer.disconnect()}},{threshold:.12});observer.observe(node);return()=>observer.disconnect()},[]);
  return <Tag ref={ref} style={{"--reveal-delay":`${delay}ms`}} className={`atpReveal ${visible?"isVisible":""} ${className}`}>{children}</Tag>
}
export function AtpButton({to,children,variant="lime",icon="solar:arrow-right-up-linear",className="",type="button",onClick}){
  const content=<>{children}<Icon icon={icon}/></>; return to?<Link className={`atpButton ${variant} ${className}`} to={to}>{content}</Link>:<button type={type} onClick={onClick} className={`atpButton ${variant} ${className}`}>{content}</button>
}
export function SectionHeading({eyebrow,title,text,light=false,action}){return <div className={`atpSectionHead ${light?"light":""}`}><div><span>{eyebrow}</span><h2>{title}</h2></div>{(text||action)&&<div className="atpSectionSide">{text&&<p>{text}</p>}{action}</div>}</div>}
export function SportCard({image,eyebrow,title,text,to,icon="solar:arrow-right-up-linear",className=""}){return <Link to={to} className={`sportCard ${className}`}><img src={image} alt=""/><span className="sportCardShade"/><div><small>{eyebrow}</small><h3>{title}</h3>{text&&<p>{text}</p>}<Icon icon={icon}/></div></Link>}
export function ScoreTape({items}){return <div className="scoreTape">{items.map(item=><div key={item.label}><Icon icon={item.icon}/><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>}
export function PageHero({eyebrow,title,text,image,actions,compact=false}){return <header className={`atpPageHero ${compact?"compact":""}`}><img src={image} alt=""/><span className="atpPageHeroShade"/><Reveal className="atpPageHeroCopy"><p>{eyebrow}</p><h1>{title}</h1>{text&&<div className="atpPageHeroBottom"><span>{text}</span>{actions&&<div>{actions}</div>}</div>}</Reveal><span className="heroBall" aria-hidden="true"/></header>}
