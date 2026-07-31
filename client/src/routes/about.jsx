import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getSiteContent } from "../libs/api/api.endpoints";
import { useCopy, Lines } from "../libs/hooks/use-copy";
import { AtpButton, PageHero, Reveal, SectionHeading } from "../components/system/system";
import heroImage from "../assets/brand/pro-serve.jpg";
import youthImage from "../assets/brand/youth-training.jpg";

export default function About() {
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: getSiteContent });
  const about = data?.pages || {};
  const copy = useCopy();
  return <main className="editorialPage aboutV3">
    <PageHero eyebrow={copy("about.hero.eyebrow", "The ATP story")} title={<Lines>{copy("about.hero.title", "Built for the\nlove of tennis.")}</Lines>} text={copy("about.hero.text", "An Abuja tennis community where serious coaching, healthy competition and genuine belonging meet.")} image={about.aboutPageImg || heroImage} actions={<AtpButton to="/membership/adult">{copy("about.hero.cta", "Join ATP")}</AtpButton>}/>
    <section className="manifestoBand"><Reveal><p>{copy("about.manifesto.eyebrow", "Our purpose")}</p><h2>{copy("about.manifesto.title", "Make the game accessible. Make every session count. Make every player feel they belong.")}</h2></Reveal></section>
    <section className="storySplit pagePad"><Reveal className="storyMedia"><img src={youthImage} alt="Young tennis players learning with an ATP coach"/><span><strong>{copy("about.story.badgeValue", "Every level")}</strong><small>{copy("about.story.badgeLabel", "One tennis community")}</small></span></Reveal><Reveal className="storyCopy"><SectionHeading eyebrow={copy("about.story.eyebrow", "Who we are")} title={copy("about.story.title", "A club with a clear point of view.")}/><p>{copy("about.story.text", "ATP is built around the belief that tennis is more than a sport. It is a lifelong practice of movement, focus and confidence. We connect beginners, developing juniors and experienced competitors with coaching and match play designed around their next step.")}</p><p>{copy("about.story.textSecondary", "From structured sessions to club tournaments, the experience is welcoming, ambitious and unmistakably local.")}</p></Reveal></section>
    <section className="principleGrid pagePad"><Reveal><Icon icon="solar:eye-linear"/><small>{copy("about.vision.eyebrow", "OUR VISION")}</small><h2>{copy("about.vision.title", "Tennis within reach.")}</h2><p>{copy("about.vision.text", "A thriving African tennis culture where anyone with the desire to play can find a court, a coach and a community.")}</p></Reveal><Reveal delay={100}><Icon icon="solar:flag-2-linear"/><small>{copy("about.mission.eyebrow", "OUR MISSION")}</small><h2>{copy("about.mission.title", "Progress with purpose.")}</h2><p>{copy("about.mission.text", "Build confident players through excellent coaching, meaningful competition and enduring connections on and off court.")}</p></Reveal></section>
    <section className="pageCta"><p>{copy("about.cta.eyebrow", "YOUR NEXT POINT STARTS HERE")}</p><h2>{copy("about.cta.title", "Come find your game.")}</h2><AtpButton to="/contact">{copy("about.cta.button", "Talk to ATP")}</AtpButton></section>
  </main>;
}
