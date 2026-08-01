/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getRankings } from "../../libs/api/api.endpoints";
import "./leaderboard.css";

const MEDAL_LABEL = { gold: "Gold", silver: "Silver", bronze: "Bronze" };
const playerName = player => player?.fullName || player?.username || "ATP player";
const initials = player => playerName(player).split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();

/**
 * The player standings, shared by the public /leaderboard page and the player dashboard.
 *
 * Order is decided by the API: points, then wins, losses, average points and games played,
 * and finally whoever reached the total first. `highlightId` marks the viewing player's row.
 */
export default function Leaderboard({ variant = "public", highlightId, limit }) {
  const { data: rankings = [], isLoading, isError } = useQuery({ queryKey: ["rankings"], queryFn: getRankings, staleTime: 120000 });
  const podium = rankings.filter(row => row.medal).slice(0, 3);
  const rows = limit ? rankings.slice(0, limit) : rankings;
  const you = highlightId ? rankings.find(row => String(row.userId) === String(highlightId)) : null;
  // A player outside the visible cut still gets their own standing pinned underneath.
  const showYourRow = Boolean(you) && !rows.some(row => String(row.userId) === String(highlightId));

  if (isLoading) return <div className="ledLoading"><i /><i /><i /></div>;
  if (isError) return <div className="ledEmpty"><Icon icon="solar:cloud-cross-linear" /><h2>Standings unavailable.</h2><p>Refresh the page to load the leaderboard again.</p></div>;
  if (!rankings.length) return <div className="ledEmpty"><Icon icon="solar:ranking-linear" /><h2>No results yet.</h2><p>The board fills up as tournament medals and friendly match scores are recorded.</p></div>;

  return <div className={`ledBoard ${variant}`}>
    {variant === "public" && podium.length > 0 && <section className="ledPodium">
      <header><span>The podium</span><small>{podium.length === 3 ? "Gold · Silver · Bronze" : "Medals go to the top three"}</small></header>
      <ol data-count={podium.length}>
        {podium.map(row => <li key={row.userId} className={row.medal}>
          <span className="ledPodiumRank">{String(row.rank).padStart(2, "0")}</span>
          <span className="ledPodiumFace">{row.player?.picture ? <img src={row.player.picture} alt="" /> : initials(row.player)}</span>
          <span className="ledPodiumWho">
            <em>{MEDAL_LABEL[row.medal]}</em>
            <strong>{playerName(row.player)}</strong>
            <small>{row.wins}W · {row.losses}L · {row.gamesPlayed} played</small>
          </span>
          <span className="ledPodiumPts"><b>{row.points}</b><i>points</i></span>
        </li>)}
      </ol>
    </section>}

    <div className="ledTableWrap">
      <table className="ledTable">
        <caption className="srOnly">Player standings ordered by points, then wins, losses, average points and games played</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col" className="ledNum">Points</th>
            <th scope="col" className="ledNum">Won</th>
            <th scope="col" className="ledNum">Lost</th>
            <th scope="col" className="ledNum">Played</th>
            <th scope="col" className="ledNum">Avg</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => <Row key={row.userId} row={row} isYou={String(row.userId) === String(highlightId)} />)}
          {showYourRow && <Row row={you} isYou separated />}
        </tbody>
      </table>
    </div>
  </div>;
}

function Row({ row, isYou, separated }) {
  return <tr className={`${row.medal ? `ledRank ${row.medal}` : ""} ${isYou ? "isYou" : ""} ${separated ? "isDetached" : ""}`.trim()}>
    <td>
      <span className="ledPosition">
        {row.medal ? <Icon className="ledRowMedal" icon="solar:medal-ribbons-star-bold" aria-label={`${MEDAL_LABEL[row.medal]} medal`} /> : null}
        {row.rank}
      </span>
    </td>
    <th scope="row">
      <span className="ledPlayer">
        <span className="ledAvatar">{row.player?.picture ? <img src={row.player.picture} alt="" /> : initials(row.player)}</span>
        <span className="ledPlayerText">
          <strong>{playerName(row.player)}{isYou && <em>You</em>}</strong>
          <small>{row.medals.gold + row.medals.silver + row.medals.bronze > 0
            ? `${row.medals.gold}G · ${row.medals.silver}S · ${row.medals.bronze}B`
            : row.player?.level || "ATP player"}</small>
        </span>
      </span>
    </th>
    <td className="ledNum ledPoints">{row.points}</td>
    <td className="ledNum">{row.wins}</td>
    <td className="ledNum">{row.losses}</td>
    <td className="ledNum">{row.gamesPlayed}</td>
    <td className="ledNum">{row.averagePoints}</td>
  </tr>;
}
