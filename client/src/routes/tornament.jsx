import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getTour } from "../libs/api/api.endpoints";
import { AtpButton, PageHero, Reveal, SectionHeading } from "../components/system/system";
import heroImage from "../assets/brand/pro-serve.png";
import winner1 from "../libs/images/imgUpdate/IMG-20241205-WA0011.jpg";
import winner2 from "../libs/images/imgUpdate/IMG-20241205-WA0012.jpg";
import winner3 from "../libs/images/imgUpdate/IMG-20241205-WA0013.jpg";
import winner4 from "../libs/images/imgUpdate/IMG-20241205-WA0014.jpg";
import winner5 from "../libs/images/imgUpdate/IMG-20241205-WA0016.jpg";
import winner6 from "../libs/images/imgUpdate/IMG-20241205-WA0017.jpg";
import winner7 from "../libs/images/imgUpdate/IMG-20241205-WA0019.jpg";
import winner8 from "../libs/images/imgUpdate/IMG-20241205-WA0020.jpg";
import winner9 from "../libs/images/imgUpdate/IMG-20241205-WA0022.jpg";
import winner10 from "../libs/images/imgUpdate/IMG-20241205-WA0023.jpg";
import winner11 from "../libs/images/imgUpdate/IMG-20241205-WA0024.jpg";
import winner12 from "../libs/images/imgUpdate/IMG-20241205-WA0025.jpg";

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  : "Date to be announced";

const championArchive = [
  { year: "2023", edition: "June championship", division: "Open winners", champion: winner1, finalist: winner2 },
  { year: "2023", edition: "December championship", division: "Open winners", champion: winner3, finalist: winner4 },
  { year: "2024", edition: "Men's championship", division: "Men's open", champion: winner5, finalist: winner6 },
  { year: "2024", edition: "Junior championship", division: "Under 14", champion: winner7, finalist: winner8 },
  { year: "2024", edition: "Junior championship", division: "Under 12", champion: winner9, finalist: winner10 },
  { year: "2024", edition: "Women's championship", division: "Women's open", champion: winner11, finalist: winner12 },
];

export default function Tournament() {
  const { data: tournaments = [], isLoading } = useQuery({ queryKey: ["tTour"], queryFn: getTour });

  return <main className="editorialPage tournamentsV3">
    <PageHero eyebrow="ATP competition" title={<>Put your game<br />on the line.</>} text="Organised match play for juniors and adults who want the focus, energy and growth that only competition brings." image={heroImage} actions={<AtpButton to="/login?redirect=%2Fu%2Ftournaments">Enter a tournament</AtpButton>} />
    <section className="eventCalendar pagePad">
      <SectionHeading eyebrow="Competition calendar" title="Your next match starts here." text="Choose an event that fits your level. ATP members can register from their player dashboard." />
      <div className="eventList">
        {isLoading ? <p className="pageState">Preparing the draw…</p> : tournaments.slice(0, 6).map((event, index) => <Reveal key={event._id || index}><article><span>{String(index + 1).padStart(2, "0")}</span><div><small>{event.tournamentType || "ATP tournament"}</small><h2>{event.tournamentName || event.name}</h2></div><p><Icon icon="solar:calendar-linear" />{formatDate(event.startDate || event.date)}</p><p><Icon icon="solar:map-point-linear" />{event.location || "ATP court"}</p><AtpButton to="/login?redirect=%2Fu%2Ftournaments" variant="ghost">Register</AtpButton></article></Reveal>)}
        {!isLoading && !tournaments.length && <div className="pageState">The next tournament draw is being prepared.</div>}
      </div>
    </section>
    <section className="championWall pagePad">
      <SectionHeading light eyebrow="Championship archive" title="Earned on court." text="Every draw leaves a record. Meet the champions and finalists who raised the standard." />
      <div className="championArchive">
        {championArchive.map((item, index) => <Reveal key={`${item.year}-${item.edition}`} delay={(index % 3) * 70}>
          <article className="championArchiveCard">
            <header><span>{item.year}</span><div><small>{item.edition}</small><h3>{item.division}</h3></div></header>
            <div className="championPair">
              <figure className="championGold"><img src={item.champion} alt={`${item.year} ${item.division} champion`} /><figcaption><b>Champion</b><span>Gold</span></figcaption></figure>
              <figure className="championSilver"><img src={item.finalist} alt={`${item.year} ${item.division} finalist`} /><figcaption><b>Finalist</b><span>Silver</span></figcaption></figure>
            </div>
            <footer><span>ATP honours</span><Icon icon="solar:medal-ribbons-star-linear" /></footer>
          </article>
        </Reveal>)}
      </div>
    </section>
    <section className="registrationSteps pagePad"><SectionHeading eyebrow="How to enter" title="Four steps to match day." /><div>{[["01", "Create your account"], ["02", "Choose membership"], ["03", "Book your tournament"], ["04", "Show up ready"]].map((step) => <article key={step[0]}><span>{step[0]}</span><h3>{step[1]}</h3></article>)}</div></section>
  </main>;
}
