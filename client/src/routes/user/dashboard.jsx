/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getCommunityTopics, getMatches, getPayMe, getTour, getUserMatchesC } from "../../libs/api/api.endpoints";
import { useAuth } from "../../libs/hooks/use-auth";
import communityImage from "../../assets/brand/club-community.png";

const tournamentId = (ticket) => String(ticket?.tournament?._id || ticket?.tournament || "");

export default function Dashboard() {
  const { user } = useAuth();
  const player = user();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-v2"],
    queryFn: async () => {
      const [billing, tournaments, matches, topics, registrations] = await Promise.all([
        getPayMe(), getTour(), getUserMatchesC(), getCommunityTopics(), getMatches(),
      ]);
      return { billing, tournaments, matches, topics, registrations };
    },
    staleTime: 300000,
  });
  const firstName = (player?.fullName || player?.username || "Player").split(" ")[0];
  const matches = data?.matches || {};
  const plan = data?.billing?.data?.membership?.plan || "Free";
  const tickets = data?.registrations?.matches || [];
  const ticketByTournament = new Map(tickets.map((ticket) => [tournamentId(ticket), ticket]));

  return (
    <main className="playerOverview">
      <section className="playerWelcome">
        <div><p>PLAYER OVERVIEW</p><h1>Ready for your<br />next point, {firstName}?</h1><span>Your training, competition and ATP community together in one place.</span></div>
        <Link to="/u/tournaments">Find a tournament <Icon icon="solar:arrow-right-up-linear" /></Link>
      </section>
      <section className="playerStats">
        <Stat icon="solar:ranking-linear" label="Club rank" value={matches.rank || "—"} />
        <Stat icon="solar:cup-star-linear" label="Match wins" value={matches.totalWins ?? "—"} />
        <Stat icon="solar:chart-2-linear" label="Matches played" value={matches.totalMatches ?? "—"} />
        <Stat icon="solar:verified-check-linear" label="Membership" value={plan} />
      </section>
      <div className="playerGrid">
        <section className="playerNext">
          <header><div><span>UP NEXT</span><h2>Your competition calendar</h2></div><Link to="/u/tournaments">View all</Link></header>
          {isLoading ? <Skeleton /> : data?.tournaments?.length ? data.tournaments.slice(0, 3).map((tour, index) => {
            const tournamentDate = tour.date || tour.startDate;
            const ticket = ticketByTournament.get(String(tour._id));
            const isPaid = Boolean(ticket);
            const tournamentName = tour.tournamentName || tour.name;
            const destination = isPaid ? `/u/tickets?open=${ticket._id}` : `/u/tournaments?pay=${tour._id}`;
            return (
              <Link className={`playerNextEvent${isPaid ? " isPaid" : ""}`} to={destination} key={tour._id || index} aria-label={isPaid ? `Open ticket for ${tournamentName}` : `Pay for ${tournamentName}`}>
                <time><strong>{tournamentDate ? new Date(tournamentDate).getDate() : "—"}</strong><span>{tournamentDate ? new Date(tournamentDate).toLocaleDateString(undefined, { month: "short" }) : "TBC"}</span></time>
                <div><small>{tour.category || tour.tournamentType || "ATP tournament"}</small><h3>{tournamentName}</h3></div>
                <span className="playerEventStatus"><Icon icon={isPaid ? "solar:ticket-sale-linear" : "solar:card-linear"} />{isPaid ? "Ticket secured" : "Payment required"}</span>
                <Icon icon="solar:arrow-right-linear" />
              </Link>
            );
          }) : <Empty icon="solar:calendar-minimalistic-linear" title="No tournament booked" text="Choose an upcoming event and put your training into match play." to="/u/tournaments" />}
        </section>
        <section className="playerCommunity">
          <img src={communityImage} alt="ATP members after a match" /><span />
          <div><small>THE CLUBHOUSE</small><h2>The match talk is live.</h2><p>{data?.topics?.[0]?.title || "Join this week's tennis conversation."}</p><Link to="/u/community">Open community <Icon icon="solar:arrow-right-linear" /></Link></div>
        </section>
      </div>
      <section className="playerActions">
        <h2>Keep moving</h2>
        <div><Action icon="solar:user-heart-rounded-linear" title="Coach" text="Sessions and feedback" to="/u/coach" /><Action icon="solar:ticket-linear" title="Tickets" text="Your event access" to="/u/tickets" /><Action icon="solar:bag-3-linear" title="Orders" text="Track ATP purchases" to="/u/orders" /><Action icon="solar:card-2-linear" title="Billing" text="Plans and history" to="/u/billings" /></div>
      </section>
    </main>
  );
}

function Stat({ icon, label, value }) { return <article><Icon icon={icon} /><div><small>{label}</small><strong>{value}</strong></div></article>; }
function Action({ icon, title, text, to }) { return <Link to={to}><Icon icon={icon} /><div><strong>{title}</strong><small>{text}</small></div><Icon icon="solar:arrow-right-up-linear" /></Link>; }
function Skeleton() { return <div className="dashSkeleton"><i /><i /><i /></div>; }
function Empty({ icon, title, text, to }) { return <div className="dashEmpty"><Icon icon={icon} /><h3>{title}</h3><p>{text}</p><Link to={to}>Explore events</Link></div>; }
