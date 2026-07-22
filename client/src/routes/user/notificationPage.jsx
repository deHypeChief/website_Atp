import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getNotify } from "../../libs/api/api.endpoints";
import { PlayerEmpty, PlayerLoading, PlayerPageHeader } from "../../components/system/player-system";
dayjs.extend(relativeTime);
export default function Notifications(){const {data:items=[],isLoading}=useQuery({queryKey:["notify"],queryFn:getNotify});return <main className="playerUtility"><PlayerPageHeader eyebrow="PLAYER UPDATES" title="Notifications" text="Tournament, membership and account updates in one place."/>{isLoading?<PlayerLoading text="Checking for updates…"/>:!items.length?<PlayerEmpty icon="solar:bell-off-linear" title="You’re all caught up." text="New ATP updates will appear here as soon as they arrive."/>:<section className="notificationList">{items.map((item,index)=><article key={item._id||index}><span><Icon icon="solar:bell-bing-linear"/></span><div><small>{item.type||"ATP update"}</small><h2>{item.title}</h2><p>{item.message||item.description}</p></div><time>{dayjs(item.createdAt).fromNow()}</time></article>)}</section>}</main>}
