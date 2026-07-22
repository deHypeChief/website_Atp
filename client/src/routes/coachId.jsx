import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getCoach } from "../libs/api/api.endpoints";
import { AtpButton, Reveal } from "../components/system/system";

export default function CoachInfo() {
  const { id } = useParams();
  const { data: coach, isLoading, isError } = useQuery({ queryKey: ["coach", id], queryFn: () => getCoach(id) });
  if (isLoading) return <main className="routeState"><span>ATP COACHING</span><h1>Preparing the profile…</h1></main>;
  if (isError || !coach) return <main className="routeState"><span>ATP COACHING</span><h1>Coach not found.</h1><AtpButton to="/coaching">All coaches</AtpButton></main>;
  return <main className="coachProfileV3"><section className="coachProfileHero"><div className="coachPortrait">{coach.imageUrl?<img src={coach.imageUrl} alt={coach.coachName}/>:<span>{coach.coachName?.charAt(0)}</span>}</div><Reveal><p>ATP COACH · {coach.level || "ALL LEVELS"}</p><h1>{coach.coachName}</h1><div className="coachRating"><Icon icon="solar:star-bold"/><strong>{coach.avgRate || "New"}</strong><span>player rating</span></div><p className="coachBio">{coach.bioInfo || "A focused ATP coach committed to helping players understand their game, build reliable habits and compete with confidence."}</p><div className="coachProfileActions"><AtpButton to="/membership/adult">Train with this coach</AtpButton><AtpButton to="/coaching" variant="ghost">Back to coaches</AtpButton></div></Reveal></section><section className="coachPromise pagePad"><div><small>COACHING FOCUS</small><h2>A session should change what you notice.</h2></div><div>{[["solar:target-linear","Clear priorities"],["solar:running-linear","Court movement"],["solar:chart-2-linear","Measurable progress"]].map(item=><article key={item[1]}><Icon icon={item[0]}/><h3>{item[1]}</h3></article>)}</div></section></main>;
}
