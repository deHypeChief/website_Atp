/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { getLiveDraws, getMatches, getMe, getTour } from "../../libs/api/api.endpoints";
import { BillingSummary } from "./billingSuport";
import { PlayerEmpty, PlayerLoading, PlayerMetric, PlayerPageHeader } from "../../components/system/player-system";
import "../../libs/styles/tournament-live-draw.css";

const money = (value) => `₦${Number(value || 0).toLocaleString()}`;
const displayName = (player) => player?.fullName || player?.username || "ATP player";

// This internal panel always receives its state and close handler from Tournaments.
function LiveDraw({ onClose, draws, isLoading }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="drawLayer">
      <button className="drawScrim" aria-label="Close live draw" onClick={onClose} />
      <aside className="liveDraw" id="live-draw-panel" role="dialog" aria-modal="true" aria-labelledby="live-draw-title">
        <header>
          <div>
            <span><i /> LIVE FROM THE CLUB</span>
            <h2 id="live-draw-title">Match centre</h2>
          </div>
          <button onClick={onClose} aria-label="Close match centre">
            <Icon icon="solar:close-circle-linear" />
          </button>
        </header>

        <div className="drawScroll">
          {isLoading ? (
            <div className="drawState"><Icon icon="solar:refresh-circle-linear" /><strong>Loading courts…</strong></div>
          ) : !draws.length ? (
            <div className="drawState">
              <Icon icon="solar:tennis-2-linear" />
              <strong>No published draw yet</strong>
              <span>The tournament desk will post court updates here.</span>
            </div>
          ) : draws.map((draw) => (
            <section className="scoreTournament" key={draw._id}>
              <header>
                <span className="scoreMark">ATP</span>
                <div>
                  <strong>{draw.tournament?.name || "ATP tournament"}</strong>
                  <small>{draw.tournament?.category || "ATP tournament"} · {draw.stage}</small>
                </div>
                <em>{draw.status === "live" ? "LIVE" : draw.status?.toUpperCase()}</em>
                <Icon icon="solar:alt-arrow-right-linear" />
              </header>

              <div className="scoreMatches">
                {draw.matches.map((match) => {
                  const playerOne = displayName(match.playerOne);
                  const playerTwo = displayName(match.playerTwo);
                  return (
                    <article key={match._id || `${playerOne}-${playerTwo}`}>
                      <span className={match.status === "live" ? "court live" : "court"}>{match.court}</span>
                      <div className="scorePlayers">
                        <span>{playerOne}</span>
                        <span>{playerTwo}</span>
                      </div>
                      <div className="scoreSets" aria-label={`${playerOne} ${match.scoreOne.join(" ")}, ${playerTwo} ${match.scoreTwo.join(" ")}`}>
                        <span>{match.scoreOne.map((score, index) => <b key={index}>{score}</b>)}</span>
                        <span>{match.scoreTwo.map((score, index) => <b key={index}>{score}</b>)}</span>
                      </div>
                      <button aria-label={`Favourite ${playerOne} versus ${playerTwo}`}>
                        <Icon icon="solar:star-linear" />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer>
          <span>Managed by the tournament desk</span>
          <strong>Auto-refreshes</strong>
        </footer>
      </aside>
    </div>
  );
}

export default function Tournaments() {
  const [payment, setPayment] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const matches = useQuery({ queryKey: ["match"], queryFn: getMatches, staleTime: 300000 });
  const tours = useQuery({ queryKey: ["tour"], queryFn: getTour, staleTime: 300000 });
  const liveDraw = useQuery({
    queryKey: ["live-draws"],
    queryFn: getLiveDraws,
    enabled: drawOpen,
    staleTime: 5000,
    refetchInterval: drawOpen ? 15000 : false,
  });
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: getMe, staleTime: 300000 });
  const items = tours.data || [];

  return (
    <main className="playerUtility">
      {payment && <BillingSummary action={setPayment} dataFn={payment} />}
      {drawOpen && <LiveDraw onClose={() => setDrawOpen(false)} draws={liveDraw.data || []} isLoading={liveDraw.isLoading} />}

      <PlayerPageHeader
        eyebrow="ATP COMPETITION"
        title="Tournaments"
        text="Choose your next event, secure a ticket and bring your training into match play."
        action={
          <button
            className="openLiveDraw"
            onClick={() => setDrawOpen(true)}
            aria-expanded={drawOpen}
            aria-controls="live-draw-panel"
          >
            <span><i /> Scores on court</span>
            Open live draw
            <Icon icon="solar:arrow-right-linear" />
          </button>
        }
      />

      <section className="metricRow">
        <PlayerMetric icon="solar:calendar-linear" label="Available events" value={items.length} />
        <PlayerMetric icon="solar:cup-star-linear" label="Tours won" value={matches.data?.matchesWon || 0} />
        <PlayerMetric icon="solar:ticket-linear" label="Tickets" value={matches.data?.matches?.length || 0} />
      </section>

      {tours.isLoading ? (
        <PlayerLoading text="Preparing the tournament list…" />
      ) : !items.length ? (
        <PlayerEmpty icon="solar:cup-star-linear" title="The next draw is coming." text="New ATP tournaments will appear here when registration opens." />
      ) : (
        <section className="dashTournamentGrid">
          {items.map((event) => (
            <article key={event._id}>
              <div>
                {event.tournamentImgURL ? <img src={event.tournamentImgURL} alt={event.name} /> : <span>ATP</span>}
                <small>{event.tournamentType || event.category || "ATP tournament"}</small>
              </div>
              <section>
                <h2>{event.name}</h2>
                <p><Icon icon="solar:calendar-linear" />{new Date(event.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
                <p><Icon icon="solar:map-point-linear" />{event.location || "ATP court"}</p>
                <footer>
                  <strong>{money(event.price)}</strong>
                  <button onClick={() => setPayment({ _id: event._id, userData: { _id: user?._id }, type: event.name, key: "Ticket", price: event.price, message: "You are about to pay for the selected tournament" })}>
                    Buy ticket <Icon icon="solar:arrow-right-linear" />
                  </button>
                </footer>
              </section>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
