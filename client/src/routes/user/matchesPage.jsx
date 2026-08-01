/* eslint-disable react/prop-types */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getUserMatchesC } from "../../libs/api/api.endpoints";
import { PlayerEmpty, PlayerLoading, PlayerMetric, PlayerPageHeader } from "../../components/system/player-system";
import "../../libs/styles/friendly-matches.css";

const initials = name => String(name || "ATP player").split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
const matchDate = value => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Date to be confirmed";

/**
 * Friendly matches — the fixtures an admin arranges outside the tournament calendar.
 * Scheduled pairings appear as soon as the admin creates them; scores follow once the
 * match is played and marked complete.
 */
export default function FriendlyMatches() {
  const [filter, setFilter] = useState("all");
  const { data = {}, isLoading } = useQuery({ queryKey: ["userMatches"], queryFn: getUserMatchesC, staleTime: 300000 });
  const assignments = data.assignments || [];
  const scheduled = assignments.filter(match => match.status !== "completed");
  const played = assignments.filter(match => match.status === "completed");
  const visible = filter === "scheduled" ? scheduled : filter === "played" ? played : assignments;

  return <main className="playerUtility">
    <PlayerPageHeader
      eyebrow="FRIENDLY MATCHES"
      title="Your fixtures"
      text="Matches arranged for you outside the tournament calendar, with the score once you have played."
    />
    <section className="metricRow">
      <PlayerMetric icon="solar:calendar-mark-linear" label="Scheduled" value={scheduled.length} />
      <PlayerMetric icon="solar:chart-2-linear" label="Played" value={data.totalMatches ?? played.length} />
      <PlayerMetric icon="solar:cup-star-linear" label="Wins" value={data.totalWins ?? 0} />
      <PlayerMetric icon="solar:ranking-linear" label="Friendly tier" value={data.rank || "Unranked"} />
    </section>

    {isLoading ? <PlayerLoading text="Loading your fixtures…" /> : !assignments.length
      ? <PlayerEmpty icon="solar:tennis-2-linear" title="No friendly matches yet." text="When an administrator pairs you for a friendly, the fixture and its score appear here." to="/u/tournaments" label="Find a tournament" />
      : <>
        <div className="friendlyFilters" role="tablist" aria-label="Filter fixtures">
          {[["all", `All (${assignments.length})`], ["scheduled", `Scheduled (${scheduled.length})`], ["played", `Played (${played.length})`]].map(([id, label]) =>
            <button key={id} role="tab" aria-selected={filter === id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}
        </div>
        {!visible.length
          ? <PlayerEmpty icon="solar:calendar-minimalistic-linear" title="Nothing here yet." text={filter === "scheduled" ? "You have no upcoming friendly fixtures." : "You have not completed a friendly match yet."} />
          : <section className="friendlyList">{visible.map(match => <MatchCard key={match.matchId} match={match} />)}</section>}
      </>}
  </main>;
}

function MatchCard({ match }) {
  const done = match.status === "completed";
  return <article className={`friendlyCard ${done ? (match.youWon ? "won" : "lost") : "scheduled"}`}>
    <header>
      <span className="friendlyType"><Icon icon="solar:tennis-2-linear" />{match.matchType} friendly</span>
      <time>{matchDate(done ? match.updatedAt : match.createdAt)}</time>
      <strong className="friendlyResult">{done ? (match.youWon ? "Won" : "Lost") : "Scheduled"}</strong>
    </header>

    <div className="friendlyCourt">
      {match.participants.map(participant => <div className={`friendlyPlayer ${participant.isYou ? "isYou" : ""} ${participant.winner ? "isWinner" : ""}`} key={participant.userId}>
        <span className="friendlyAvatar">{participant.picture ? <img src={participant.picture} alt="" /> : initials(participant.name)}</span>
        <span className="friendlyName">{participant.isYou ? "You" : participant.name}{participant.winner && <Icon icon="solar:cup-star-bold" aria-label="Winner" />}</span>
        <strong className="friendlyScore">{participant.score ?? "–"}</strong>
      </div>)}
    </div>

    <footer>{done
      ? <span><Icon icon="solar:check-circle-linear" />Final score recorded</span>
      : <span><Icon icon="solar:clock-circle-linear" />Waiting to be played — your score appears here afterwards</span>}</footer>
  </article>;
}
