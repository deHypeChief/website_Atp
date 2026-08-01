import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getRankings } from "../../libs/api/api.endpoints";
import { useAuth } from "../../libs/hooks/use-auth";
import { PlayerMetric, PlayerPageHeader } from "../../components/system/player-system";
import Leaderboard from "../../components/leaderboard/leaderboard";

const ordinal = rank => {
  if (!rank) return "—";
  const tens = rank % 100;
  if (tens >= 11 && tens <= 13) return `${rank}th`;
  return `${rank}${["th", "st", "nd", "rd"][rank % 10] || "th"}`;
};

export default function PlayerLeaderboard() {
  const { user } = useAuth();
  const player = user() || {};
  const { data: rankings = [] } = useQuery({ queryKey: ["rankings"], queryFn: getRankings, staleTime: 120000 });
  const you = rankings.find(row => String(row.userId) === String(player._id));

  return <main className="playerUtility">
    <PlayerPageHeader
      eyebrow="STANDINGS"
      title="Leaderboard"
      text="Where you sit against the rest of the club, and what it takes to climb."
      action={<Link className="ledHeaderLink" to="/leaderboard">Public board <Icon icon="solar:arrow-right-up-linear" /></Link>}
    />
    <section className="metricRow">
      <PlayerMetric icon="solar:ranking-linear" label="Your rank" value={ordinal(you?.rank)} />
      <PlayerMetric icon="solar:medal-ribbons-star-linear" label="Points" value={you?.points ?? 0} />
      <PlayerMetric icon="solar:cup-star-linear" label="Won" value={you?.wins ?? 0} />
      <PlayerMetric icon="solar:chart-2-linear" label="Average points" value={you?.averagePoints ?? 0} />
    </section>
    <Leaderboard variant="dashboard" highlightId={player._id} />
    <p className="ledFootnote">Ranked on total points. Wins, losses, games played and average points break a tie, in that order — and if players are still level, whoever reached the total first stays ahead.</p>
  </main>;
}
