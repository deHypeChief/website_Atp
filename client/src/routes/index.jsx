import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getNews, getSiteContent, getTour, subscribeNewsletter } from "../libs/api/api.endpoints";
import { AtpButton, PageHero, Reveal, ScoreTape, SectionHeading, SportCard } from "../components/system/system";
import heroImage from "../assets/brand/hero-pro-player.png";
import serveImage from "../assets/brand/pro-serve.png";
import youthImage from "../assets/brand/youth-training.png";
import communityImage from "../assets/brand/club-community.png";
import "../libs/styles/home-v2.css";

const programs=[
  {image:serveImage,eyebrow:"Performance track",title:"Train with intent",text:"Structured sessions for players ready to build technique, movement and match confidence.",to:"/coaching"},
  {image:youthImage,eyebrow:"Junior pathway",title:"Start them strong",text:"Age-aware coaching that makes every lesson active, safe and genuinely fun.",to:"/membership/children"},
  {image:communityImage,eyebrow:"The clubhouse",title:"Find your people",text:"Talk tennis, challenge your instincts and stay connected beyond the final point.",to:"/community"},
];
const memberships=[{name:"Open court",price:"Free",text:"A player account, tournaments and the public ATP community."},{name:"Club player",price:"₦6K",suffix:"/ month",text:"Training benefits, member events and priority tournament access.",featured:true},{name:"Season player",price:"₦15K",suffix:"/ quarter",text:"The complete club experience with better long-term value."}];

const hasUsefulCopy = value => Boolean(value && !/lorem ipsum|cras tincidunt/i.test(value));

export default function Home(){
 const [message,setMessage]=useState("");
 const {data:tournaments=[]}=useQuery({queryKey:["indexTour"],queryFn:getTour});
 const {data:siteContent}=useQuery({queryKey:["site-content"],queryFn:getSiteContent});
 const {data:news=[]}=useQuery({queryKey:["news"],queryFn:getNews});
 const content=siteContent?.pages;
 const subscribe=async e=>{e.preventDefault();try{const result=await subscribeNewsletter(e.currentTarget.email.value);setMessage(result.message)}catch(error){setMessage(error.message)}};
 return <main className="homeV2">
  <PageHero eyebrow="Amateur Tennis Pro · Lagos" title={<>Own the court.<br/>Build your game.</>} text="Training, competition and a tennis community built for every level of ambition." image={heroImage} actions={<><AtpButton to="/signup">Join the club</AtpButton><AtpButton to="/coaching" variant="ghost">Find training</AtpButton></>}/>
  <ScoreTape items={[{icon:"solar:users-group-rounded-bold",value:"500+",label:"active players"},{icon:"solar:medal-ribbons-star-bold",value:"20+",label:"ATP coaches"},{icon:"solar:cup-star-bold",value:"12",label:"annual events"},{icon:"solar:map-point-wave-bold",value:"Lagos",label:"home court"}]}/>

  <section className="homeIntro atpShell"><Reveal><SectionHeading eyebrow="Built around the player" title="More than a place to hit balls." text={hasUsefulCopy(content?.homePageAboutText) ? content.homePageAboutText : "ATP combines structured training, real competition and a welcoming club culture so every player has a clear next step."} action={<AtpButton to="/about" variant="navy">Meet ATP</AtpButton>}/></Reveal><div className="programGrid">{programs.map((program,index)=><Reveal key={program.title} delay={index*90}><SportCard {...program}/></Reveal>)}</div></section>

  <section className="homeFeature"><div className="featureImage"><img src={serveImage} alt="Professional player serving on a blue tennis court"/><span className="featureBall"/></div><Reveal className="featureCopy"><p>PLAY WITH A PLAN</p><h2>{hasUsefulCopy(content?.homePageCoachTitle) ? content.homePageCoachTitle : "A better game starts with better feedback."}</h2><span>{hasUsefulCopy(content?.homePageCoachText) ? content.homePageCoachText : "Work with coaches who meet you at your level, then build every session around where you want to go."}</span><AtpButton to="/coaching">Explore coaching</AtpButton><div className="featureMetrics"><div><strong>1:1</strong><small>Personal coaching</small></div><div><strong>All</strong><small>Skill levels</small></div></div></Reveal></section>

  <section className="homeTournaments atpShell"><SectionHeading eyebrow="Competition calendar" title="Put your game in play." text="Club tournaments turn training into match experience—competitive, organised and open to ATP players." action={<AtpButton to="/tournaments" variant="ghost">All tournaments</AtpButton>}/><div className="tournamentRows">{tournaments.slice(0,3).map((item,index)=><Reveal key={item._id||index} className="tournamentRow"><span>{String(index+1).padStart(2,"0")}</span><div><small>{item.tournamentType||"ATP Tournament"}</small><h3>{item.tournamentName||item.name}</h3></div><time>{item.startDate?new Date(item.startDate).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"Coming soon"}</time><Icon icon="solar:arrow-right-up-linear"/></Reveal>)}{!tournaments.length&&<div className="atpEmpty">The next tournament draw is being prepared.</div>}</div></section>

  <section className="homeMembership"><div className="atpShell"><SectionHeading light eyebrow="Membership" title="Choose how you play." text="Start free. Move up when you want more training, access and club benefits."/><div className="membershipGrid">{memberships.map(plan=><Reveal key={plan.name} className={`memberCard ${plan.featured?"featured":""}`}><small>{plan.featured?"Most popular":"Membership"}</small><h3>{plan.name}</h3><p>{plan.text}</p><div><strong>{plan.price}</strong><span>{plan.suffix}</span></div><AtpButton to="/membership/adult" variant={plan.featured?"lime":"ghost"}>See membership</AtpButton></Reveal>)}</div></div></section>

  <section className="homeYouth atpShell"><div className="youthCopy"><SectionHeading eyebrow="Junior tennis" title="Confidence starts here." text="Our junior pathway gives young players the coaching, movement skills and encouragement to enjoy the game for life."/><AtpButton to="/membership/children" variant="navy">Junior programs</AtpButton></div><Reveal className="youthImage"><img src={youthImage} alt="Black children learning tennis with their coach"/><div><strong>8–17</strong><span>Age-aware development</span></div></Reveal></section>

  <section className="homeCommunity"><img src={communityImage} alt="ATP players talking together after a match"/><span className="communityShade"/><Reveal><p>THE ATP CLUBHOUSE</p><h2>Tennis is better<br/>with people.</h2><span>Join the conversation, answer the weekly challenge and keep the match going.</span><AtpButton to="/community">Enter community</AtpButton></Reveal></section>

  {news.length>0&&<section className="homeStories atpShell"><SectionHeading eyebrow="Courtside notes" title="Fresh from the baseline." action={<AtpButton to="/news" variant="ghost">All stories</AtpButton>}/><div>{news.slice(0,3).map((story,index)=><Reveal key={story._id} delay={index*80}><Link to={`/news/${story.slug}`} className="storyCard"><div>{story.imageUrl?<img src={story.imageUrl} alt=""/>:<span>ATP</span>}</div><small>{story.category}</small><h3>{story.title}</h3><p>{story.excerpt}</p></Link></Reveal>)}</div></section>}

  <section className="homeNewsletter"><div><span>ATP / COURTSIDE</span><h2>Stay close<br/>to the game.</h2></div><form onSubmit={subscribe}><label htmlFor="home-email">Tournament news, training notes and club updates.</label><div><input id="home-email" name="email" type="email" placeholder="Your email address" required/><button type="submit" aria-label="Subscribe"><Icon icon="solar:plain-2-linear"/></button></div>{message&&<p>{message}</p>}</form></section>
 </main>
}
