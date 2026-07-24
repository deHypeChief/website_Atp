/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { getLiveDraws } from "../../libs/api/api.endpoints";
import "../../libs/styles/live-score-ticker.css";

const displayName = (player) => player?.fullName || player?.username || "ATP player";
const displayScore = (scores) => Array.isArray(scores) && scores.length ? scores.join(" ") : "—";

function ScoreGroup({ matches, duplicate = false }) {
  return (
    <div className="liveTickerGroup" aria-hidden={duplicate || undefined}>
      {matches.map((match, index) => (
        <article className="liveTickerMatch" key={`${duplicate ? "copy" : "score"}-${match.id}-${index}`}>
          <small>{match.tournament} <span>·</span> {match.court}</small>
          <div><span>{match.playerOne}</span><strong>{displayScore(match.scoreOne)}</strong></div>
          <div><span>{match.playerTwo}</span><strong>{displayScore(match.scoreTwo)}</strong></div>
        </article>
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

  useEffect(() => {
    if (!isPublic) return undefined;
    const updateVisibility = () => setHasScrolled(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [isPublic, location.pathname]);

  const matches = useMemo(() => draws.flatMap((draw) => (draw.matches || []).map((match, index) => ({
    id: match._id || `${draw._id}-${index}`,
    tournament: draw.tournament?.name || "ATP tournament",
    court: match.court || draw.stage || "Court",
    playerOne: displayName(match.playerOne),
    playerTwo: displayName(match.playerTwo),
    scoreOne: match.scoreOne,
    scoreTwo: match.scoreTwo,
  }))).slice(0, 6), [draws]);

  if (!matches.length || (isPublic && (!isPublicPage || !hasScrolled))) return null;

  const destination = isPublic ? "/tournaments" : "/u/tournaments";

  return (
    <aside className={`liveScoreTicker liveScoreTicker--${mode}`} aria-label="Live tennis scores">
      <Link className="liveTickerLead" to={destination}>
        <span><i /> On court now</span>
        <strong>Match centre</strong>
      </Link>
      <div className="liveTickerViewport">
        <div className="liveTickerRail">
          <ScoreGroup matches={matches} />
          <ScoreGroup matches={matches} duplicate />
        </div>
      </div>
      <Link className="liveTickerOpen" to={destination} aria-label="Open Match Centre">
        <Icon icon="solar:arrow-right-linear" />
      </Link>
    </aside>
  );
}
