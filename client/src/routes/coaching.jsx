import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { getCoaches } from "../libs/api/api.endpoints";
import { AtpButton, PageHero, Reveal, SectionHeading } from "../components/system/system";
import heroImage from "../assets/brand/youth-training.png";

export default function Coaching() {
  const { data: coaches = [], isLoading } = useQuery({ queryKey: ["coachesMem"], queryFn: getCoaches });
  return <main className="editorialPage coachingV3">
    <PageHero eyebrow="ATP coaching" title={<>Train with<br/>a clear plan.</>} text="Find a coach who understands your level, your ambition and the work between the two." image={heroImage} actions={<AtpButton to="/membership/adult">Start training</AtpButton>}/>
    <section className="coachMethod pagePad"><SectionHeading eyebrow="The ATP method" title="Feedback you can use." text="Every programme connects technique, movement and match decisions—so improvement carries from the training court into competition."/><div className="methodSteps">{[["01","Assess","Start with the player you are today."],["02","Build","Train the details that unlock your game."],["03","Compete","Turn practice into confident decisions."]].map((step,index)=><Reveal key={step[0]} delay={index*80}><span>{step[0]}</span><Icon icon={["solar:clipboard-check-linear","solar:tennis-2-linear","solar:cup-star-linear"][index]}/><h3>{step[1]}</h3><p>{step[2]}</p></Reveal>)}</div></section>
    <section className="coachRoster pagePad"><SectionHeading eyebrow="Meet the team" title="Coaches behind the progress." text="Choose a profile to learn more about their experience and coaching focus."/><div className="coachGrid">{isLoading?<p className="pageState">Preparing the coaching team…</p>:coaches.map((coach,index)=><Reveal key={coach._id} delay={(index%3)*70}><Link className="coachCardV3" to={`/coaching/${coach._id}`}><div>{coach.imageUrl?<img src={coach.imageUrl} alt={coach.coachName}/>:<span>{coach.coachName?.charAt(0)}</span>}<small>{coach.level || "ATP coach"}</small></div><h3>{coach.coachName}</h3><p><Icon icon="solar:star-bold"/> {coach.avgRate || "New"} rating</p><span>View profile <Icon icon="solar:arrow-right-up-linear"/></span></Link></Reveal>)}{!isLoading&&!coaches.length&&<p className="pageState">Coach profiles are being prepared.</p>}</div></section>
  </main>;
}
