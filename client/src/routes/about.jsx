import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getSiteContent } from "../libs/api/api.endpoints";
import { AtpButton, PageHero, Reveal, SectionHeading } from "../components/system/system";
import heroImage from "../assets/brand/pro-serve.png";
import youthImage from "../assets/brand/youth-training.png";

export default function About() {
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: getSiteContent });
  const about = data?.pages || {};
  return <main className="editorialPage aboutV3">
    <PageHero eyebrow="The ATP story" title={<>Built for the<br/>love of tennis.</>} text="A Lagos tennis community where serious coaching, healthy competition and genuine belonging meet." image={about.aboutPageImg || heroImage} actions={<AtpButton to="/membership/adult">Join ATP</AtpButton>}/>
    <section className="manifestoBand"><Reveal><p>Our purpose</p><h2>Make the game accessible. Make every session count. Make every player feel they belong.</h2></Reveal></section>
    <section className="storySplit pagePad"><Reveal className="storyMedia"><img src={youthImage} alt="Young tennis players learning with an ATP coach"/><span><strong>Every level</strong><small>One tennis community</small></span></Reveal><Reveal className="storyCopy"><SectionHeading eyebrow="Who we are" title={about.aboutStoryHeader || "A club with a clear point of view."}/><p>{about.aboutStoryText || "ATP is built around the belief that tennis is more than a sport. It is a lifelong practice of movement, focus and confidence. We connect beginners, developing juniors and experienced competitors with coaching and match play designed around their next step."}</p><p>From structured sessions to club tournaments, the experience is welcoming, ambitious and unmistakably local.</p></Reveal></section>
    <section className="principleGrid pagePad"><Reveal><Icon icon="solar:eye-linear"/><small>OUR VISION</small><h2>{about.aboutVisionHeader || "Tennis within reach."}</h2><p>{about.aboutVisionText || "A thriving African tennis culture where anyone with the desire to play can find a court, a coach and a community."}</p></Reveal><Reveal delay={100}><Icon icon="solar:flag-2-linear"/><small>OUR MISSION</small><h2>{about.aboutMissionHeader || "Progress with purpose."}</h2><p>{about.aboutMissionText || "Build confident players through excellent coaching, meaningful competition and enduring connections on and off court."}</p></Reveal></section>
    <section className="pageCta"><p>YOUR NEXT POINT STARTS HERE</p><h2>Come find your game.</h2><AtpButton to="/contact">Talk to ATP</AtpButton></section>
  </main>;
}
