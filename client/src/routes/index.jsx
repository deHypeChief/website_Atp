/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getNews, getTour, subscribeNewsletter } from "../libs/api/api.endpoints";
import { useCopy, Lines } from "../libs/hooks/use-copy";
import { AtpButton, PageHero, Reveal, ScoreTape, SectionHeading, SportCard } from "../components/system/system";
import heroImage from "../assets/brand/hero-pro-player.jpg";
import serveImage from "../assets/brand/pro-serve.jpg";
import youthImage from "../assets/brand/youth-training.jpg";
import communityImage from "../assets/brand/club-community.jpg";
import clubhousePreview from "../assets/product/clubhouse-preview.jpg";
import StorePromo from "../components/store-promo/store-promo";
import kit1 from "../assets/slides/kit-1.jpg";
import kit2 from "../assets/slides/kit-2.jpg";
import kit3 from "../assets/slides/kit-3.jpg";
import kit4 from "../assets/slides/kit-4.jpg";
import kit5 from "../assets/slides/kit-5.jpg";
import kit6 from "../assets/slides/kit-6.jpg";
import "../libs/styles/home-v2.css";

const youthSlides=[kit1,kit2,kit3,kit4,kit5,kit6];

/**
 * The looping clip behind the coaching feature.
 *
 * It is decoration, so it stays muted and carries the still as its poster: the file is large
 * and the poster is what fills the panel until enough of it has arrived. Readers who asked
 * their system for reduced motion keep that still instead of the loop.
 */
function FeatureVideo(){
  const [motionOk,setMotionOk]=useState(true);

  useEffect(()=>{
    const query=window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>setMotionOk(!query.matches);
    sync();
    query.addEventListener("change",sync);
    return()=>query.removeEventListener("change",sync);
  },[]);

  if(!motionOk)return <img src={serveImage} alt="Professional player serving on a blue tennis court"/>;

  return <video
    src="/vid/coaching-feature.mp4"
    poster={serveImage}
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    aria-label="Coaching session on an ATP court"
  />;
}

// Copy for these cards is admin-editable, so they are built per render from the copy store.
const buildPrograms=copy=>[
  {image:serveImage,eyebrow:copy("home.programs.performance.eyebrow","Performance track"),title:copy("home.programs.performance.title","Train with intent"),text:copy("home.programs.performance.text","Structured sessions for players ready to build technique, movement and match confidence."),to:"/coaching"},
  {image:youthImage,eyebrow:copy("home.programs.junior.eyebrow","Junior pathway"),title:copy("home.programs.junior.title","Start them strong"),text:copy("home.programs.junior.text","Age-aware coaching that makes every lesson active, safe and genuinely fun."),to:"/membership/children"},
  {image:communityImage,eyebrow:copy("home.programs.clubhouse.eyebrow","The clubhouse"),title:copy("home.programs.clubhouse.title","Find your people"),text:copy("home.programs.clubhouse.text","Talk tennis, challenge your instincts and stay connected beyond the final point."),to:"/community"},
];
const buildMemberships=copy=>[
  {name:copy("home.membership.free.name","Open court"),price:copy("home.membership.free.price","Free"),text:copy("home.membership.free.text","A player account, tournaments and the public ATP community.")},
  {name:copy("home.membership.club.name","Club player"),price:copy("home.membership.club.price","₦6K"),suffix:copy("home.membership.club.suffix","/ month"),text:copy("home.membership.club.text","Training benefits, member events and priority tournament access."),featured:true},
  {name:copy("home.membership.season.name","Season player"),price:copy("home.membership.season.price","₦15K"),suffix:copy("home.membership.season.suffix","/ quarter"),text:copy("home.membership.season.text","The complete club experience with better long-term value.")},
];

// Slides are stacked and cross-faded rather than moved on a track, so the wrap from the
// last image back to the first has no seam and the loop runs indefinitely.
function SlideShow({images,interval=4500}){
  const [index,setIndex]=useState(0);
  useEffect(()=>{
    if(images.length<2) return;
    if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id=setInterval(()=>setIndex(current=>(current+1)%images.length),interval);
    return ()=>clearInterval(id);
  },[images.length,interval]);
  return <ul className="atpSlideShow">
    {/* The first two load eagerly so the opening transition is never blank; the rest are
        lazy and have several seconds in view before their turn comes round. */}
    {images.map((image,position)=><li key={image} className={position===index?"isActive":""} aria-hidden={position!==index}><img src={image} alt="" loading={position<2?"eager":"lazy"}/></li>)}
  </ul>;
}

export default function Home(){
 const [message,setMessage]=useState("");
 const {data:tournaments=[]}=useQuery({queryKey:["indexTour"],queryFn:getTour});
 const {data:news=[]}=useQuery({queryKey:["news"],queryFn:getNews});
 // useCopy runs the same "site-content" query, so the page copy arrives with one request.
 const copy=useCopy();
 const programs=buildPrograms(copy);
 const memberships=buildMemberships(copy);
 const subscribe=async e=>{e.preventDefault();try{const result=await subscribeNewsletter(e.currentTarget.email.value);setMessage(result.message)}catch(error){setMessage(error.message)}};
 return <main className="homeV2">
  <PageHero eyebrow={copy("home.hero.eyebrow","Amateur Tennis Pro · Abuja")} title={<Lines>{copy("home.hero.title","Own the court.\nBuild your game.")}</Lines>} text={copy("home.hero.text","Training, competition and a tennis community built for every level of ambition.")} image={heroImage} actions={<><AtpButton to="/signup">{copy("home.hero.primaryCta","Join the club")}</AtpButton><AtpButton to="/coaching" variant="ghost">{copy("home.hero.secondaryCta","Find training")}</AtpButton></>}/>
  <StorePromo placement="landing" />
  <ScoreTape items={[{icon:"solar:users-group-rounded-bold",value:copy("home.stats.players.value","500+"),label:copy("home.stats.players.label","active players")},{icon:"solar:medal-ribbons-star-bold",value:copy("home.stats.coaches.value","20+"),label:copy("home.stats.coaches.label","ATP coaches")},{icon:"solar:cup-star-bold",value:copy("home.stats.events.value","12"),label:copy("home.stats.events.label","annual events")},{icon:"solar:map-point-wave-bold",value:copy("home.stats.home.value","Abuja"),label:copy("home.stats.home.label","home court")}]}/>

  <section className="homeIntro atpShell"><Reveal><SectionHeading eyebrow={copy("home.intro.eyebrow","Built around the player")} title={copy("home.intro.title","More than a place to hit balls.")} text={copy("home.intro.text","ATP combines structured training, real competition and a welcoming club culture so every player has a clear next step.")} action={<AtpButton to="/about" variant="navy">{copy("home.intro.cta","Meet ATP")}</AtpButton>}/></Reveal><div className="programGrid">{programs.map((program,index)=><Reveal key={program.title} delay={index*90}><SportCard {...program}/></Reveal>)}</div></section>

  <section className="homeFeature"><div className="featureImage"><FeatureVideo/><span className="featureBall"/></div><Reveal className="featureCopy"><p>{copy("home.feature.eyebrow","PLAY WITH A PLAN")}</p><h2>{copy("home.feature.title","A better game starts with better feedback.")}</h2><span>{copy("home.feature.text","Work with coaches who meet you at your level, then build every session around where you want to go.")}</span><AtpButton to="/coaching">{copy("home.feature.cta","Explore coaching")}</AtpButton><div className="featureMetrics"><div><strong>{copy("home.feature.metricOneValue","1:1")}</strong><small>{copy("home.feature.metricOneLabel","Personal coaching")}</small></div><div><strong>{copy("home.feature.metricTwoValue","All")}</strong><small>{copy("home.feature.metricTwoLabel","Skill levels")}</small></div></div></Reveal></section>

  <section className="homeTournaments atpShell"><SectionHeading eyebrow={copy("home.tournaments.eyebrow","Competition calendar")} title={copy("home.tournaments.title","Put your game in play.")} text={copy("home.tournaments.text","Club tournaments turn training into match experience—competitive, organised and open to ATP players.")} action={<AtpButton to="/tournaments" variant="ghost">{copy("home.tournaments.cta","All tournaments")}</AtpButton>}/><div className="tournamentRows">{tournaments.slice(0,3).map((item,index)=><Reveal key={item._id||index} className="tournamentRow"><span>{String(index+1).padStart(2,"0")}</span><div><small>{item.tournamentType||"ATP Tournament"}</small><h3>{item.tournamentName||item.name}</h3></div><time>{item.startDate?new Date(item.startDate).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"Coming soon"}</time><Icon icon="solar:arrow-right-up-linear"/></Reveal>)}{!tournaments.length&&<div className="atpEmpty">{copy("home.tournaments.empty","The next tournament draw is being prepared.")}</div>}</div></section>

  <section className="homeMembership"><div className="atpShell"><SectionHeading light eyebrow={copy("home.membership.eyebrow","Membership")} title={copy("home.membership.title","Choose how you play.")} text={copy("home.membership.text","Start free. Move up when you want more training, access and club benefits.")}/><div className="membershipGrid">{memberships.map(plan=><Reveal key={plan.name} className={`memberCard ${plan.featured?"featured":""}`}><small>{plan.featured?"Most popular":"Membership"}</small><h3>{plan.name}</h3><p>{plan.text}</p><div><strong>{plan.price}</strong><span>{plan.suffix}</span></div><AtpButton to="/membership/adult" variant={plan.featured?"lime":"ghost"}>See membership</AtpButton></Reveal>)}</div></div></section>

  <section className="homeYouth atpShell"><div className="youthCopy"><SectionHeading eyebrow={copy("home.youth.eyebrow","Junior tennis")} title={copy("home.youth.title","Confidence starts here.")} text={copy("home.youth.text","Our junior pathway gives young players the coaching, movement skills and encouragement to enjoy the game for life.")}/><AtpButton to="/gallery" variant="navy">{copy("home.youth.cta","See the gallery")}</AtpButton></div><Reveal className="youthImage"><SlideShow images={youthSlides}/><div><strong>{copy("home.youth.badgeValue","8–17")}</strong><span>{copy("home.youth.badgeLabel","Age-aware development")}</span></div></Reveal></section>

  <section className="homeCommunity"><img className="communityBackdrop" src={communityImage} alt="ATP players talking together after a match"/><span className="communityShade"/>
   <Reveal className="communityCopy"><p>{copy("home.community.eyebrow","THE ATP CLUBHOUSE")}</p><h2><Lines>{copy("home.community.title","Tennis is better\nwith people.")}</Lines></h2><span>{copy("home.community.text","Join the conversation, answer the weekly challenge and keep the match going.")}</span><AtpButton to="/community">{copy("home.community.cta","Enter community")}</AtpButton></Reveal>
   {/* A real capture of the clubhouse, so the section shows the product rather than describing it. */}
   <Reveal className="communityPreview" delay={140}><figure><span className="communityPreviewBar"><i/><i/><i/><small>atp / community</small></span><img src={clubhousePreview} alt="The ATP clubhouse feed showing member polls, discussions and club activity" loading="lazy"/></figure><span className="communityPreviewTag">{copy("home.community.previewTag","Live in the clubhouse")}</span></Reveal>
  </section>

  {news.length>0&&<section className="homeStories atpShell"><SectionHeading eyebrow={copy("home.stories.eyebrow","Courtside notes")} title={copy("home.stories.title","Fresh from the baseline.")} action={<AtpButton to="/news" variant="ghost">{copy("home.stories.cta","All stories")}</AtpButton>}/><div>{news.slice(0,3).map((story,index)=><Reveal key={story._id} delay={index*80}><Link to={`/news/${story.slug}`} className="storyCard"><div>{story.imageUrl?<img src={story.imageUrl} alt=""/>:<span>ATP</span>}</div><small>{story.category}</small><h3>{story.title}</h3><p>{story.excerpt}</p></Link></Reveal>)}</div></section>}

  <section className="homeNewsletter"><div><span>{copy("home.newsletter.eyebrow","ATP / COURTSIDE")}</span><h2><Lines>{copy("home.newsletter.title","Stay close\nto the game.")}</Lines></h2></div><form onSubmit={subscribe}><label htmlFor="home-email">{copy("home.newsletter.label","Tournament news, training notes and club updates.")}</label><div><input id="home-email" name="email" type="email" placeholder="Your email address" required/><button type="submit" aria-label="Subscribe"><Icon icon="solar:plain-2-linear"/></button></div>{message&&<p>{message}</p>}</form></section>
 </main>
}
