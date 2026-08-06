/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { getFriendlyFixtures, getLiveDraws } from "../../libs/api/api.endpoints";
import "../../libs/styles/live-score-ticker.css";

const displayName = (player) => player?.fullName || player?.username || "ATP player";
const displayScore = (scores) => Array.isArray(scores) && scores.length ? scores.join(" ") : "—";

function DrawMatch({ match }) {
  return (
    <article className="liveTickerMatch">
      <small>{match.tournament} <span>·</span> {match.court}</small>
      <div><span>{match.playerOne}</span><strong>{displayScore(match.scoreOne)}</strong></div>
      <div><span>{match.playerTwo}</span><strong>{displayScore(match.scoreTwo)}</strong></div>
    </article>
  );
}

/**
 * A friendly fixture, read as one line: who is playing, when and where.
 *
 * A played fixture shows each player's score with the winner marked; a scheduled one shows
 * the time instead, because there is no score to report yet.
 */
function FixtureMatch({ fixture }) {
  return (
    <article className={`liveTickerMatch liveTickerFriendly ${fixture.played ? "played" : "scheduled"}`}>
      <small>
        <b>{fixture.day}</b>
        {fixture.time && <> <span>·</span> {fixture.time}</>}
        {fixture.venue && <> <span>·</span> {fixture.venue}</>}
      </small>
      {fixture.participants.map((player, index) => (
        <div key={`${fixture.id}-${player.name}-${index}`}>
          <span>
            {player.name}
            {player.winner && <Icon className="liveTickerWin" icon="solar:medal-ribbon-star-bold" aria-label="Winner" />}
          </span>
          <strong>{fixture.played ? (player.score ?? "—") : ""}</strong>
        </div>
      ))}
    </article>
  );
}

function TickerGroup({ entries, duplicate = false }) {
  return (
    <div className="liveTickerGroup" aria-hidden={duplicate || undefined}>
      {entries.map((entry, index) => (
        <div className="liveTickerCell" key={`${duplicate ? "copy" : "item"}-${entry.key}-${index}`}>
          {entry.kind === "draw" ? <DrawMatch match={entry.match} /> : <FixtureMatch fixture={entry.fixture} />}
        </div>
      ))}
    </div>
  );
}

export default function LiveScoreTicker({ mode = "dashboard" }) {
  const location = useLocation();
  const [hasScrolled, setHasScrolled] = useState(false);
  const isPublic = mode === "public";
  const isPublicPage = !location.pathname.startsWith("/u")
    && !["/login", "/signup", "/forgot-password", "/reset-password"].some((path) => location.pathname.startsWith(path));
  const { data: draws = [] } = useQuery({
    queryKey: ["live-draws"],
    queryFn: getLiveDraws,
    staleTime: 5000,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });
  // Friendlies change far less often than a live draw, so they poll more gently.
  const { data: fixtures = [] } = useQuery({
    queryKey: ["friendly-fixtures"],
    queryFn: getFriendlyFixtures,
    staleTime: 60000,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isPublic) return undefined;
    const updateVisibility = () => setHasScrolled(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [isPublic, location.pathname]);

  const drawEntries = useMemo(() => draws.flatMap((draw) => (draw.matches || []).map((match, index) => ({
    kind: "draw",
    key: match._id || `${draw._id}-${index}`,
    match: {
      tournament: draw.tournament?.name || "ATP tournament",
      court: match.court || draw.stage || "Court",
      playerOne: displayName(match.playerOne),
      playerTwo: displayName(match.playerTwo),
      scoreOne: match.scoreOne,
      scoreTwo: match.scoreTwo,
    },
  }))), [draws]);

  const fixtureEntries = useMemo(
    () => fixtures.map((fixture) => ({ kind: "fixture", key: fixture.id, fixture })),
    [fixtures],
  );

  // Tournament play leads — it is the live event. Friendlies fill the rest of the rail.
  const entries = useMemo(
    () => [...drawEntries, ...fixtureEntries].slice(0, 10),
    [drawEntries, fixtureEntries],
  );

  if (!entries.length || (isPublic && (!isPublicPage || !hasScrolled))) return null;

  const destination = isPublic ? "/tournaments" : "/u/tournaments";
  const live = drawEntries.length > 0;

  return (
    <aside className={`liveScoreTicker liveScoreTicker--${mode}`} aria-label="Live tennis scores and friendly fixtures">
      <Link className="liveTickerLead" to={destination}>
        <span>{live && <i />}{live ? "On court now" : "Fixtures"}</span>
        <strong>Match centre</strong>
      </Link>
      <div className="liveTickerViewport">
        <div className="liveTickerRail">
          <TickerGroup entries={entries} />
          <TickerGroup entries={entries} duplicate />
        </div>
      </div>
      <Link className="liveTickerOpen" to={destination} aria-label="Open Match Centre">
        <Icon icon="solar:arrow-right-linear" />
      </Link>
    </aside>
  );
}
