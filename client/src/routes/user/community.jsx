/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import {
  createCommunityPost,
  createMemberPoll,
  getCommunityTopic,
  getCommunityTopics,
  getEngagementItems,
  likeCommunityTopic,
  postCommunityComment,
  respondToEngagement,
} from "../../libs/api/api.endpoints";
import { useAuth } from "../../libs/hooks/use-auth";
import "./community.css";

const participantId = () => {
  let id = localStorage.getItem("atp-participant-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("atp-participant-id", id);
  }
  return id;
};

const memberName = member => member?.fullName || member?.username || "ATP member";
const initials = member => memberName(member).split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
const timeAgo = value => {
  if (!value) return "Just now";
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const errorMessage = error => error?.response?.data?.message || "That could not be published. Try again.";

export default function PlayerCommunity() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [topicId, setTopicId] = useState(null);
  const voterId = participantId();
  const qc = useQueryClient();
  const topics = useQuery({ queryKey: ["community-topics", voterId], queryFn: () => getCommunityTopics(voterId) });
  const polls = useQuery({ queryKey: ["engagement", voterId], queryFn: () => getEngagementItems(voterId) });
  const { user } = useAuth();
  const player = user() || {};

  const feed = useMemo(() => {
    const posts = (topics.data || []).map(item => ({ ...item, feedType: "post" }));
    const pollItems = (polls.data || []).filter(item => item.kind === "poll").map(item => ({ ...item, feedType: "poll" }));
    const term = query.trim().toLowerCase();
    return [...posts, ...pollItems]
      .filter(item => filter === "all" || item.feedType === filter)
      .filter(item => !term || `${item.title || ""} ${item.prompt || ""} ${item.question || ""} ${item.tag || ""}`.toLowerCase().includes(term))
      .sort((a, b) => new Date(b.lastActivityAt || b.createdAt || 0) - new Date(a.lastActivityAt || a.createdAt || 0));
  }, [filter, polls.data, query, topics.data]);

  if (topicId) return <CommunityThread id={topicId} viewerId={voterId} back={() => { qc.invalidateQueries({ queryKey: ["community-topics", voterId] }); setTopicId(null); }} />;

  const replyTotal = (topics.data || []).reduce((sum, topic) => sum + (topic.replyCount || 0), 0);
  return <main className="clubhouse">
    <header className="clubhouseTopbar">
      <div><span>ATP CLUBHOUSE</span><h1>Community</h1><p>Trade match notes, ask the room and keep the club conversation moving.</p></div>
      <label className="clubhouseSearch"><Icon icon="solar:magnifer-linear" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search discussions and polls" /></label>
    </header>

    <div className="clubhouseLayout">
      <section className="clubhouseMain" aria-label="Community feed">
        <CommunityComposer player={player} />
        <div className="clubhouseFeedHead">
          <div><strong>Club feed</strong><span>{feed.length} conversations</span></div>
          <div role="tablist" aria-label="Filter community feed">
            {[{ id: "all", label: "All" }, { id: "post", label: "Discussions" }, { id: "poll", label: "Polls" }].map(item => <button key={item.id} role="tab" aria-selected={filter === item.id} className={filter === item.id ? "active" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </div>
        </div>

        {(topics.isLoading || polls.isLoading) && <div className="clubhouseLoading"><i /><i /><i /></div>}
        {(topics.isError || polls.isError) && <div className="clubhouseEmpty"><Icon icon="solar:cloud-cross-linear" /><h2>The feed is taking a breather.</h2><p>Refresh the page to reconnect with the clubhouse.</p></div>}
        {!topics.isLoading && !polls.isLoading && !feed.length && <div className="clubhouseEmpty"><Icon icon="solar:chat-round-line-linear" /><h2>No conversations found.</h2><p>Adjust the filter or start a new post above.</p></div>}
        <div className="clubhouseFeed">
          {feed.map(item => item.feedType === "post" ? <PostCard key={`post-${item._id}`} item={item} open={() => setTopicId(item._id)} voterId={voterId} /> : <PollCard key={`poll-${item._id}`} item={item} voterId={voterId} />)}
        </div>
      </section>

      <aside className="clubhouseRail">
        <section className="clubhouseProfile">
          <div className="clubhouseProfileCourt"><span /></div>
          <Avatar member={player} large />
          <small>Welcome to the clubhouse</small>
          <h2>{memberName(player)}</h2>
          <p>{player.level ? `${player.level} player` : "ATP member"}</p>
          <div><span><strong>{topics.data?.length || 0}</strong>Discussions</span><span><strong>{polls.data?.filter(item => item.kind === "poll").length || 0}</strong>Polls</span></div>
        </section>
        <ClubPulse topics={topics.data || []} replyTotal={replyTotal} />
        <section className="clubhouseCode">
          <Icon icon="solar:shield-check-linear" />
          <div><strong>Play the point, respect the player.</strong><p>Keep debate useful, specific and welcoming.</p></div>
        </section>
      </aside>
    </div>
  </main>;
}

function Avatar({ member, large = false }) {
  return <span className={`clubhouseAvatar ${large ? "large" : ""}`}>{member?.picture ? <img src={member.picture} alt="" /> : initials(member)}</span>;
}

function CommunityComposer({ player }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [notice, setNotice] = useState("");
  const reset = message => { setTitle(""); setBody(""); setOptions(["", ""]); setMode(null); setNotice(message); };
  const post = useMutation({ mutationFn: createCommunityPost, onSuccess: data => { qc.invalidateQueries({ queryKey: ["community-topics"] }); reset(data.message); }, onError: error => setNotice(errorMessage(error)) });
  const poll = useMutation({ mutationFn: createMemberPoll, onSuccess: data => { qc.invalidateQueries({ queryKey: ["engagement"] }); reset(data.message); }, onError: error => setNotice(errorMessage(error)) });
  const pending = post.isPending || poll.isPending;
  const submit = event => {
    event.preventDefault();
    setNotice("");
    if (mode === "post") post.mutate({ title, prompt: body, tag: "Player talk" });
    if (mode === "poll") poll.mutate({ question: title, options: options.map(label => ({ label })) });
  };
  return <section className={`clubhouseComposer ${mode ? "isOpen" : ""}`}>
    <div className="clubhouseComposerStart"><Avatar member={player} /><button onClick={() => { setMode("post"); setNotice(""); }}>Share something with the club...</button></div>
    <div className="clubhouseComposerActions">
      <button className={mode === "post" ? "active" : ""} onClick={() => { setMode(mode === "post" ? null : "post"); setNotice(""); }}><Icon icon="solar:pen-new-square-linear" />Create post</button>
      <button className={mode === "poll" ? "active" : ""} onClick={() => { setMode(mode === "poll" ? null : "poll"); setNotice(""); }}><Icon icon="solar:chart-square-linear" />Create poll</button>
    </div>
    {mode && <form onSubmit={submit}>
      <div className="clubhouseComposerTitle"><span>{mode === "post" ? "NEW DISCUSSION" : "NEW MEMBER POLL"}</span><button type="button" onClick={() => setMode(null)} aria-label="Close composer"><Icon icon="solar:close-circle-linear" /></button></div>
      <label>{mode === "post" ? "Discussion title" : "Poll question"}<input required maxLength={mode === "post" ? 140 : 220} value={title} onChange={event => setTitle(event.target.value)} placeholder={mode === "post" ? "What should the club talk about?" : "What do you want the club to decide?"} /></label>
      {mode === "post" ? <label>Your post<textarea required maxLength="2500" value={body} onChange={event => setBody(event.target.value)} placeholder="Add context, match notes or a question for other players." /></label> : <div className="clubhousePollFields"><span>Answer options</span>{options.map((option, index) => <div key={index}><input required value={option} onChange={event => setOptions(current => current.map((value, optionIndex) => optionIndex === index ? event.target.value : value))} placeholder={`Option ${index + 1}`} />{options.length > 2 && <button type="button" onClick={() => setOptions(current => current.filter((_, optionIndex) => optionIndex !== index))} aria-label={`Remove option ${index + 1}`}><Icon icon="solar:trash-bin-trash-linear" /></button>}</div>)}{options.length < 6 && <button type="button" onClick={() => setOptions(current => [...current, ""])}><Icon icon="solar:add-circle-linear" />Add option</button>}</div>}
      <footer><span>{mode === "post" ? `${body.length}/2500` : "Votes are anonymous"}</span><div><button type="button" onClick={() => setMode(null)}>Cancel</button><button disabled={pending}>{pending ? "Publishing..." : mode === "post" ? "Publish post" : "Publish poll"}</button></div></footer>
    </form>}
    {notice && <p className="clubhouseNotice" role="status">{notice}</p>}
  </section>;
}

function PostCard({ item, open, voterId }) {
  const qc = useQueryClient();
  const like = useMutation({
    mutationFn: likeCommunityTopic,
    onSuccess: data => qc.setQueryData(["community-topics", voterId], current => (current || []).map(topic => topic._id === item._id ? { ...topic, hasLiked: data.liked, likeCount: data.likeCount } : topic)),
  });
  const comments = (item.previewComments || []).slice(0, 5);
  return <article className="clubhouseCard clubhousePost">
    <header><Avatar member={item.author} /><div><strong>{memberName(item.author)}</strong><span>{timeAgo(item.createdAt)} · {item.tag || "Open court"}</span></div>{item.pinned && <em><Icon icon="solar:pin-linear" />Pinned</em>}</header>
    <button className="clubhousePostOpen" onClick={open}><h2>{item.title}</h2><p>{item.prompt}</p></button>
    {!!comments.length && <div className="clubhouseCommentPreview">{comments.map(comment => <button key={comment._id} onClick={open}><Avatar member={comment.author} /><span className="clubhouseCommentText"><strong>{memberName(comment.author)}</strong><small>{comment.body}</small></span><time>{timeAgo(comment.createdAt)}</time></button>)}</div>}
    <footer><div className="clubhousePostMetrics"><button className={item.hasLiked ? "liked" : ""} aria-pressed={Boolean(item.hasLiked)} disabled={like.isPending} onClick={() => like.mutate({ topicId: item._id, participantId: voterId })}><Icon icon={item.hasLiked ? "solar:heart-bold" : "solar:heart-linear"} /><strong>{item.likeCount || 0}</strong> likes</button><span><Icon icon="solar:eye-linear" /><strong>{item.viewCount || 0}</strong> views</span><button onClick={open}><Icon icon="solar:chat-round-dots-linear" /><strong>{item.replyCount || 0}</strong> comments</button></div><button onClick={open}>Join discussion <Icon icon="solar:arrow-right-linear" /></button></footer>
  </article>;
}

function PollCard({ item, voterId }) {
  const [result, setResult] = useState(null);
  const qc = useQueryClient();
  const vote = useMutation({
    mutationFn: respondToEngagement,
    onSuccess: data => { setResult(data); qc.invalidateQueries({ queryKey: ["engagement", voterId] }); },
    onError: () => qc.invalidateQueries({ queryKey: ["engagement", voterId] }),
  });
  const answered = Boolean(result || item.hasResponded || item.status === "closed");
  const options = result?.result?.options || item.options;
  const total = answered ? options.reduce((sum, option) => sum + option.votes, 0) : item.totalResponses;
  return <article className="clubhouseCard clubhousePoll">
    <header><Avatar member={item.author} /><div><strong>{memberName(item.author)}</strong><span>{timeAgo(item.createdAt)} · Member poll</span></div><em><Icon icon="solar:chart-square-linear" />Poll</em></header>
    <h2>{item.question}</h2>
    <div className="clubhousePollOptions">{options.map(option => { const percentage = total ? Math.round(option.votes / total * 100) : 0; return <button key={option._id} disabled={answered || vote.isPending} onClick={() => vote.mutate({ id: item._id, optionId: option._id, participantId: voterId })}><span>{option.label}</span>{answered && <strong>{option.votes || 0} · {percentage}%</strong>}{answered && <i style={{ "--poll-fill": `${percentage}%` }} />}</button>; })}</div>
    <footer><span><Icon icon="solar:users-group-rounded-linear" />{total || 0} votes</span>{vote.isError && !answered && <span className="clubhouseError">{errorMessage(vote.error)}</span>}{answered && <span className="clubhouseSuccess">{result ? "Vote recorded" : "Results shown"}</span>}</footer>
  </article>;
}

function ClubPulse({ topics, replyTotal }) {
  const tags = Object.entries(topics.reduce((all, topic) => ({ ...all, [topic.tag || "Open court"]: (all[topic.tag || "Open court"] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return <section className="clubhousePulse"><header><div><span>THIS WEEK</span><h2>Club pulse</h2></div><Icon icon="solar:graph-up-linear" /></header><div className="clubhousePulseScore"><strong>{replyTotal}</strong><span>discussion replies</span></div><ul>{(tags.length ? tags : [["Match play", 0], ["Training", 0], ["Gear talk", 0]]).map(([tag, count], index) => <li key={tag}><span>{String(index + 1).padStart(2, "0")}</span><strong>{tag}</strong><em>{count}</em></li>)}</ul></section>;
}

function CommunityThread({ id, viewerId, back }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [parentId, setParentId] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ["community-topic", id, viewerId], queryFn: () => getCommunityTopic(id, viewerId) });
  const post = useMutation({ mutationFn: postCommunityComment, onSuccess: () => { setBody(""); setParentId(null); qc.invalidateQueries({ queryKey: ["community-topic", id, viewerId] }); qc.invalidateQueries({ queryKey: ["community-topics"] }); } });
  if (isLoading) return <div className="clubhouseLoading"><i /><i /><i /></div>;
  const roots = data?.comments?.filter(comment => !comment.parent) || [];
  return <main className="clubhouseThread">
    <button className="clubhouseBack" onClick={back}><Icon icon="solar:arrow-left-linear" />Back to club feed</button>
    <article className="clubhouseThreadLead"><header><Avatar member={data?.topic?.author} /><div><strong>{memberName(data?.topic?.author)}</strong><span>{timeAgo(data?.topic?.createdAt)} · {data?.topic?.tag}</span></div></header><h1>{data?.topic?.title}</h1><p>{data?.topic?.prompt}</p><footer><span><Icon icon="solar:eye-linear" />{data?.topic?.viewCount || 0} views</span><span><Icon icon="solar:heart-linear" />{data?.topic?.likeCount || 0} likes</span><span><Icon icon="solar:chat-round-dots-linear" />{data?.topic?.replyCount || 0} replies</span></footer></article>
    <form className="clubhouseReply" onSubmit={event => { event.preventDefault(); post.mutate({ topicId: id, body, parentId }); }}><label>{parentId ? "Reply to this member" : "Add to the discussion"}<textarea required value={body} onChange={event => setBody(event.target.value)} placeholder={parentId ? "Write your reply..." : "Share a useful response with the club..."} /></label><div>{parentId && <button type="button" onClick={() => setParentId(null)}>Cancel reply</button>}<button disabled={!body.trim() || post.isPending}>{post.isPending ? "Posting..." : "Post response"}</button></div>{post.isError && <p className="clubhouseError">{errorMessage(post.error)}</p>}</form>
    <section className="clubhouseComments"><header><h2>Club replies</h2><span>{roots.length} conversations</span></header>{roots.map(comment => <Comment key={comment._id} comment={comment} replies={data.comments.filter(reply => String(reply.parent) === String(comment._id))} reply={() => setParentId(comment._id)} />)}{!roots.length && <div className="clubhouseEmpty"><Icon icon="solar:chat-round-line-linear" /><h2>Be first on court.</h2><p>Start the conversation with a useful reply.</p></div>}</section>
  </main>;
}

function Comment({ comment, replies, reply }) {
  return <article className="clubhouseComment"><Avatar member={comment.author} /><div><header><strong>{memberName(comment.author)}</strong><time>{timeAgo(comment.createdAt)}</time></header><p>{comment.status === "removed" ? "Response removed by moderator." : comment.body}</p>{comment.status !== "removed" && <button onClick={reply}><Icon icon="solar:reply-linear" />Reply</button>}{replies.map(item => <aside key={item._id}><Avatar member={item.author} /><div><strong>{memberName(item.author)}</strong><time>{timeAgo(item.createdAt)}</time><p>{item.status === "removed" ? "Reply removed by moderator." : item.body}</p></div></aside>)}</div></article>;
}
