import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { getCoaches } from "../libs/api/api.endpoints";
import { useCopy, Lines } from "../libs/hooks/use-copy";
import { AtpButton, PageHero, Reveal, SectionHeading } from "../components/system/system";
import heroImage from "../assets/brand/youth-training.jpg";

export default function Coaching() {
  const { data: coaches = [], isLoading } = useQuery({ queryKey: ["coachesMem"], queryFn: getCoaches });
  const copy = useCopy();
  const steps = [
    ["01", copy("coaching.method.stepOneTitle", "Assess"), copy("coaching.method.stepOneText", "Start with the player you are today.")],
    ["02", copy("coaching.method.stepTwoTitle", "Build"), copy("coaching.method.stepTwoText", "Train the details that unlock your game.")],
    ["03", copy("coaching.method.stepThreeTitle", "Compete"), copy("coaching.method.stepThreeText", "Turn practice into confident decisions.")],
  ];
  return <main className="editorialPage coachingV3">
    <PageHero eyebrow={copy("coaching.hero.eyebrow", "ATP coaching")} title={<Lines>{copy("coaching.hero.title", "Train with\na clear plan.")}</Lines>} text={copy("coaching.hero.text", "Find a coach who understands your level, your ambition and the work between the two.")} image={heroImage} actions={<AtpButton to="/membership/adult">{copy("coaching.hero.cta", "Start training")}</AtpButton>}/>
    <section className="coachMethod pagePad"><SectionHeading eyebrow={copy("coaching.method.eyebrow", "The ATP method")} title={copy("coaching.method.title", "Feedback you can use.")} text={copy("coaching.method.text", "Every programme connects technique, movement and match decisions—so improvement carries from the training court into competition.")}/><div className="methodSteps">{steps.map((step,index)=><Reveal key={step[0]} delay={index*80}><span>{step[0]}</span><Icon icon={["solar:clipboard-check-linear","solar:tennis-2-linear","solar:cup-star-linear"][index]}/><h3>{step[1]}</h3><p>{step[2]}</p></Reveal>)}</div></section>
    <section className="coachRoster pagePad"><SectionHeading eyebrow={copy("coaching.roster.eyebrow", "Meet the team")} title={copy("coaching.roster.title", "Coaches behind the progress.")} text={copy("coaching.roster.text", "Choose a profile to learn more about their experience and coaching focus.")}/><div className="coachGrid">{isLoading?<p className="pageState">{copy("coaching.roster.loading", "Preparing the coaching team…")}</p>:coaches.map((coach,index)=><Reveal key={coach._id} delay={(index%3)*70}><Link className="coachCardV3" to={`/coaching/${coach._id}`}><div>{coach.imageUrl?<img src={coach.imageUrl} alt={coach.coachName}/>:<span>{coach.coachName?.charAt(0)}</span>}</div><h3>{coach.coachName}</h3><p><Icon icon="solar:star-bold"/> {coach.avgRate || "New"} rating</p>{coach.bioInfo&&<p className="coachCardBio">{coach.bioInfo}</p>}<span>View profile <Icon icon="solar:arrow-right-up-linear"/></span></Link></Reveal>)}{!isLoading&&!coaches.length&&<p className="pageState">{copy("coaching.roster.empty", "Coach profiles are being prepared.")}</p>}</div></section>
  </main>;
}
