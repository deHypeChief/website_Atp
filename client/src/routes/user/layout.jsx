/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import logo from "../../libs/images/logo.svg";
import { getBillingPage, getNotify, markNotifyRead } from "../../libs/api/api.endpoints";
import { useAuth } from "../../libs/hooks/use-auth";
import { shopLinkProps } from "../../libs/shop";
import LiveScoreTicker from "../../components/system/live-score-ticker";
import "../../libs/styles/dashboard-v2.css";
import "../../libs/styles/dashboard-hero-image.css";
import "../../libs/styles/notifications.css";

const nav = [
  { label: "Overview", to: "/u", end: true, icon: "solar:widget-5-linear" },
  { label: "Community", to: "/u/community", icon: "solar:chat-round-dots-linear" },
  { label: "My coach", to: "/u/coach", icon: "solar:user-heart-rounded-linear" },
  { label: "Tournaments", to: "/u/tournaments", icon: "solar:cup-star-linear" },
  { label: "Friendly matches", to: "/u/matches", icon: "solar:tennis-2-linear" },
  { label: "Tickets", to: "/u/tickets", icon: "solar:ticket-linear" },
  // Order history lives on the ATP ROYALE storefront, so this leaves the dashboard.
  { label: "Orders", shop: "/orders", icon: "solar:bag-3-linear", external: true },
  { label: "Notifications", to: "/u/notifications", icon: "solar:bell-linear" },
  { label: "Billing", to: "/u/billings", icon: "solar:card-2-linear" },
  // Requested as the final item in the player menu.
  { label: "Leaderboard", to: "/u/leaderboard", icon: "solar:ranking-linear" },
];

/**
 * The fixtures a player has not seen yet.
 *
 * A friendly match arrives as an unread notification in the "match" category, so a player
 * who has already opened their notifications is not shown this again.
 */
function FixtureAlert({ fixtures, onClose }) {
  const [index, setIndex] = useState(0);
  const fixture = fixtures[index];
  if (!fixture) return null;

  const last = index === fixtures.length - 1;
  return (
    <div className="fixtureAlert" role="dialog" aria-modal="true" aria-labelledby="fixture-alert-title">
      <section>
        <span className="fixtureAlertMark"><Icon icon="solar:tennis-2-bold" /></span>
        <small>{fixtures.length > 1 ? `Fixture ${index + 1} of ${fixtures.length}` : "Your next fixture"}</small>
        <h2 id="fixture-alert-title">{fixture.title}</h2>
        <p>{fixture.message}</p>
        <div>
          <button type="button" className="fixtureAlertGhost" onClick={() => onClose()}>
            {last ? "Close" : "Skip all"}
          </button>
          {last ? (
            <Link to="/u/matches" onClick={() => onClose()}>
              See my matches <Icon icon="solar:arrow-right-linear" />
            </Link>
          ) : (
            <button type="button" onClick={() => setIndex(index + 1)}>
              Next fixture <Icon icon="solar:arrow-right-linear" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [alertDone, setAlertDone] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userLogout, user } = useAuth();
  const localUser = user();
  const { data, isError } = useQuery({
    queryKey: ["billing-page-v2"],
    queryFn: getBillingPage,
    staleTime: 900000,
    refetchOnWindowFocus: false,
  });
  // Shares the "notify" cache with the notifications page, so marking one read
  // updates the badge immediately rather than waiting for the next poll.
  const { data: notifications } = useQuery({
    queryKey: ["notify"],
    queryFn: getNotify,
    refetchInterval: 60000,
  });
  const unreadCount = notifications?.unreadCount || 0;
  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount;

  // Newest first from the API, so the oldest unseen fixture is shown first.
  const matchAlerts = alertDone
    ? []
    : (notifications?.notifications || [])
      .filter((item) => item.category === "match" && item.status !== "read")
      .slice()
      .reverse();
  // A player who never opens their notifications should still get a greeting, not a queue
  // of them. The rest stay unread in the notifications list, where they belong.
  const fixtures = matchAlerts.slice(0, 3);

  const dismissFixtures = useMutation({
    mutationFn: (items) => Promise.all(items.map((item) => markNotifyRead(item._id))),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notify"] }),
  });

  // Closed for this visit straight away, so the dialog cannot flash back while the reads
  // save. Everything unseen is cleared, including any fixture beyond the shown few.
  const closeFixtures = () => {
    setAlertDone(true);
    dismissFixtures.mutate(matchAlerts);
  };

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (footer) footer.style.display = "none";
    return () => {
      if (footer) footer.style.display = "";
    };
  }, []);

  useEffect(() => {
    if (isError) navigate("/login");
  }, [isError, navigate]);

  const player = data?.user || localUser || {};
  const name = player.fullName || player.username || "ATP Player";
  const rawPlan = data?.billing?.data?.membership?.plan;
  const plan = !rawPlan || rawPlan === "none" ? "Free" : rawPlan;

  return (
    <div className="dashV2">
      {fixtures.length > 0 && <FixtureAlert fixtures={fixtures} onClose={closeFixtures} />}
      <aside className={open ? "open" : ""}>
        <Link className="dashLogo" to="/">
          <img src={logo} alt="ATP" />
        </Link>

        <nav>
          {nav.map((item) => (item.external ? (
            <a key={item.shop} {...shopLinkProps(item.shop)}>
              <Icon icon={item.icon} />
              <span>{item.label}</span>
              <Icon className="dashNavExternal" icon="solar:arrow-right-up-linear" />
            </a>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)}>
              <Icon icon={item.icon} />
              <span>{item.label}</span>
              {item.to === "/u/notifications" && unreadCount > 0 && <i className="dashBadge">{unreadLabel}</i>}
            </NavLink>
          )))}
        </nav>

        <div className="dashAsideBottom">
          <Link to="/">
            <Icon icon="solar:home-2-linear" />
            ATP website
          </Link>
          <button onClick={() => { userLogout(); navigate("/login"); }}>
            <Icon icon="solar:logout-2-linear" />
            Sign out
          </button>
          <div className="dashPlayer">
            <span>{player.picture ? <img src={player.picture} alt="" /> : name.charAt(0)}</span>
            <div>
              <strong>{name}</strong>
              <small>{plan} member</small>
            </div>
          </div>
        </div>
      </aside>

      <div className="dashMain">
        <header>
          <button onClick={() => setOpen(!open)} aria-label="Toggle dashboard menu">
            <Icon icon={open ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} />
          </button>
          <div>
            <small>PLAYER DESK</small>
            <span>ATP International</span>
          </div>
          <div className="dashHeaderActions">
            <Link to="/u/community">
              <Icon icon="solar:chat-round-dots-linear" />
              <span>Clubhouse</span>
            </Link>
            <Link className="dashBellLink" to="/u/notifications" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}>
              <Icon icon={unreadCount > 0 ? "solar:bell-bing-bold" : "solar:bell-linear"} />
              {unreadCount > 0 && <i className="dashBadge">{unreadLabel}</i>}
            </Link>
          </div>
        </header>
        <LiveScoreTicker />
        <div className="dashOutlet"><Outlet /></div>
      </div>

      {open && <button className="dashScrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </div>
  );
}
