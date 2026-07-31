import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getNotify, markAllNotifyRead, markNotifyRead } from "../../libs/api/api.endpoints";
import { PlayerEmpty, PlayerLoading, PlayerPageHeader } from "../../components/system/player-system";
import "../../libs/styles/notifications.css";

dayjs.extend(relativeTime);

const categoryIcon = {
  match: "solar:tennis-2-linear",
  community: "solar:chat-round-dots-linear",
  tournament: "solar:cup-star-linear",
  billing: "solar:card-2-linear",
  general: "solar:bell-bing-linear",
};

export default function Notifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["notify"], queryFn: getNotify, refetchInterval: 60000 });
  const items = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const refresh = () => qc.invalidateQueries({ queryKey: ["notify"] });
  const readOne = useMutation({ mutationFn: markNotifyRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: markAllNotifyRead, onSuccess: refresh });

  const open = item => {
    if (item.status !== "read") readOne.mutate(item._id);
    if (item.link) navigate(item.link);
  };

  return (
    <main className="playerUtility">
      <PlayerPageHeader
        eyebrow="PLAYER UPDATES"
        title="Notifications"
        text="Match assignments, community replies and account updates in one place."
        action={unreadCount > 0 && (
          <button className="notificationReadAll" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
            Mark all read <strong>{unreadCount}</strong>
          </button>
        )}
      />
      {isLoading ? <PlayerLoading text="Checking for updates…" /> : !items.length ? (
        <PlayerEmpty icon="solar:bell-off-linear" title="You’re all caught up." text="New ATP updates will appear here as soon as they arrive." />
      ) : (
        <section className="notificationList">
          {items.map((item, index) => {
            const unread = item.status !== "read";
            const interactive = unread || Boolean(item.link);
            return (
              <article
                key={item._id || index}
                className={unread ? "isUnread" : ""}
                onClick={interactive ? () => open(item) : undefined}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={interactive ? event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(item); } } : undefined}
              >
                <span><Icon icon={categoryIcon[item.category] || categoryIcon.general} /></span>
                <div>
                  <small>{item.category && item.category !== "general" ? item.category : item.type || "ATP update"}</small>
                  <h2>{item.title}</h2>
                  <p>{item.message || item.description}</p>
                </div>
                <time dateTime={item.createdAt}>{dayjs(item.createdAt).fromNow()}</time>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
