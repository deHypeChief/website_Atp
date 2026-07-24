import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMatches } from "../../libs/api/api.endpoints";
import { PlayerEmpty, PlayerLoading, PlayerMetric, PlayerPageHeader } from "../../components/system/player-system";

export default function Tickets() {
  const [selected, setSelected] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const handledTicket = useRef("");
  const { data, isLoading } = useQuery({ queryKey: ["match"], queryFn: getMatches });
  const tickets = useMemo(() => data?.matches || [], [data?.matches]);

  useEffect(() => {
    const requestedTicket = new URLSearchParams(location.search).get("open");
    if (!requestedTicket || handledTicket.current === requestedTicket || isLoading) return;
    handledTicket.current = requestedTicket;
    const ticket = tickets.find((item) => String(item._id) === requestedTicket);
    if (ticket) setSelected(ticket);
    navigate("/u/tickets", { replace: true });
  }, [isLoading, location.search, navigate, tickets]);

  return (
    <main className="playerUtility">
      {selected && (
        <div className="ticketModal" role="dialog" aria-modal="true" aria-label="Tournament ticket">
          <section>
            <button aria-label="Close ticket" onClick={() => setSelected(null)}><Icon icon="solar:close-circle-linear" /></button>
            <small>ATP TOURNAMENT PASS</small>
            <QRCodeCanvas value={JSON.stringify(selected)} size={190} />
            <code>{selected.token}</code>
            <h2>{selected.tournament?.name}</h2>
            <dl>
              <div><dt>Date</dt><dd>{new Date(selected.tournament?.date).toLocaleString()}</dd></div>
              <div><dt>Venue</dt><dd>{selected.tournament?.location}</dd></div>
            </dl>
            <p>Present this code when you arrive at the tournament.</p>
          </section>
        </div>
      )}

      <PlayerPageHeader eyebrow="MATCH ACCESS" title="Your tickets" text="Every ATP tournament pass, ready when you need it." />
      <section className="metricRow">
        <PlayerMetric icon="solar:ticket-linear" label="Tickets bought" value={tickets.length} />
        <PlayerMetric icon="solar:calendar-linear" label="Upcoming" value={tickets.filter((item) => new Date(item.tournament?.date) > new Date()).length} />
        <PlayerMetric icon="solar:verified-check-linear" label="Access" value="Digital" />
      </section>

      {isLoading ? (
        <PlayerLoading text="Loading your passes…" />
      ) : !tickets.length ? (
        <PlayerEmpty icon="solar:ticket-linear" title="No tickets yet." text="Choose an ATP tournament and your digital pass will appear here." to="/u/tournaments" label="Find a tournament" />
      ) : (
        <section className="ticketGridV3">
          {tickets.map((ticket, index) => (
            <article key={ticket._id || index}>
              <div>{ticket.tournament?.tournamentImgURL ? <img src={ticket.tournament.tournamentImgURL} alt="" /> : <span>ATP</span>}</div>
              <small>{new Date(ticket.tournament?.date).toLocaleDateString()}</small>
              <h2>{ticket.tournament?.name}</h2>
              <p><Icon icon="solar:map-point-linear" />{ticket.tournament?.location}</p>
              <button onClick={() => setSelected(ticket)}>Open ticket <Icon icon="solar:qr-code-linear" /></button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
