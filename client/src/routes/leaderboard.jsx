import { PageHero } from "../components/system/system";
import Leaderboard from "../components/leaderboard/leaderboard";
import { useCopy } from "../libs/hooks/use-copy";
import heroImage from "../assets/brand/hero-pro-player.jpg";

/** Public standings. The same board appears in the player dashboard at /u/leaderboard. */
export default function LeaderboardPage() {
  const copy = useCopy();
  return <main className="ledPage">
    <PageHero
      compact
      eyebrow={copy("leaderboard.hero.eyebrow", "ATP standings")}
      title={copy("leaderboard.hero.title", "The leaderboard.")}
      text={copy("leaderboard.hero.text", "Every ATP player ranked on the points they have won. Medals go to the top three.")}
      image={heroImage}
    />
    <section className="ledSection atpShell">
      <Leaderboard variant="public" />
      <p className="ledFootnote">{copy("leaderboard.note", "Players are ranked on total points. Wins, losses, games played and average points break a tie, in that order — and if players are still level, whoever reached the total first stays ahead.")}</p>
    </section>
  </main>;
}
