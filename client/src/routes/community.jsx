/* eslint-disable react/prop-types */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCommunityTopic, getCommunityTopics, getEngagementItems, postCommunityComment, respondToEngagement } from "../libs/api/api.endpoints";
import { useAuth } from "../libs/hooks/use-auth";
import "../libs/styles/community.css";

const participantId = () => {
  let id = localStorage.getItem("atp-participant-id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("atp-participant-id", id); }
  return id;
};

export default function Community() {
  const [mode, setMode] = useState("talk");
  const topics = useQuery({ queryKey: ["community-topics"], queryFn: getCommunityTopics });
  const engagement = useQuery({ queryKey: ["engagement"], queryFn: getEngagementItems });
  const activeCount = (topics.data?.filter(topic => topic.status === "published").length || 0) + (engagement.data?.filter(item => item.status === "published").length || 0);
  return <main className="clubhouse">
    <header className="clubhouseHero">
      <div className="courtLines" aria-hidden="true" />
      <p className="clubhouseEyebrow">ATP International Clubhouse</p>
      <h1>The match continues<br/><em>after the last point.</em></h1>
      <p className="clubhouseIntro">Trade opinions, test your tennis instinct, and hear how the rest of the club sees the game.</p>
      <div className="matchStrip"><span><i/> Live in the clubhouse</span><strong>{activeCount}</strong><small>open conversations & challenges</small></div>
    </header>
    <nav className="clubhouseModes" aria-label="Community sections">
      <button className={mode === "talk" ? "active" : ""} onClick={() => setMode("talk")}><small>DISCUSS</small>Talk tennis</button>
      <button className={mode === "play" ? "active" : ""} onClick={() => setMode("play")}><small>COMPETE</small>Quiz & polls</button>
    </nav>
    {mode === "talk" ? <Talk topics={topics.data || []} loading={topics.isLoading}/> : <Play items={engagement.data || []} loading={engagement.isLoading}/>} 
  </main>;
}

function Talk({topics, loading}) {
  const [selected, setSelected] = useState(null);
  const ordered = useMemo(() => [...topics].sort((a,b) => Number(b.pinned)-Number(a.pinned)), [topics]);
  if (selected) return <Thread topicId={selected} onBack={() => setSelected(null)}/>;
  return <section className="clubhousePanel">
    <div className="panelHeading"><div><span>FROM THE BASELINE</span><h2>What the club is talking about</h2></div><p>Pick a conversation and add your view.</p></div>
    {loading ? <Loading/> : !ordered.length ? <Empty title="The court is quiet—for now." text="The first discussion will appear here when an administrator publishes it."/> : <div className="topicList">{ordered.map((topic, index) => <button className="topicRow" key={topic._id} onClick={() => setSelected(topic._id)}>
      <span className="topicIndex">{String(index+1).padStart(2,"0")}</span><span className="topicBody"><small>{topic.pinned ? "PINNED · " : ""}{topic.tag}</small><strong>{topic.title}</strong><span>{topic.prompt}</span></span><span className="topicMeta"><strong>{topic.replyCount}</strong> replies<br/><small>{topic.status === "locked" ? "Closed" : "Join in →"}</small></span>
    </button>)}</div>}
  </section>;
}

function Thread({topicId,onBack}) {
  const qc = useQueryClient(); const {user} = useAuth(); const currentUser = user();
  const [body,setBody] = useState(""); const [parent,setParent] = useState(null);
  const query = useQuery({queryKey:["community-topic",topicId],queryFn:()=>getCommunityTopic(topicId)});
  const post = useMutation({mutationFn:postCommunityComment,onSuccess:()=>{setBody("");setParent(null);qc.invalidateQueries({queryKey:["community-topic",topicId]});qc.invalidateQueries({queryKey:["community-topics"]})}});
  const comments = query.data?.comments || []; const roots = comments.filter(comment => !comment.parent);
  const repliesFor = id => comments.filter(comment => String(comment.parent) === String(id));
  return <section className="clubhousePanel threadPanel"><button className="backToTopics" onClick={onBack}>← All discussions</button>
    {query.isLoading ? <Loading/> : <><div className="threadHeading"><span>{query.data?.topic.tag}</span><h2>{query.data?.topic.title}</h2><p>{query.data?.topic.prompt}</p></div>
    <div className="conversation"><div className="composer">
      {parent && <div className="replyingTo">Replying to {parent.author?.fullName || parent.author?.username}<button onClick={()=>setParent(null)}>Cancel</button></div>}
      {currentUser ? <><textarea value={body} maxLength={1500} onChange={e=>setBody(e.target.value)} placeholder="Add your view to the conversation…"/><div><small>{body.length}/1500</small><button disabled={!body.trim() || post.isPending || query.data?.topic.status === "locked"} onClick={()=>post.mutate({topicId,body,parentId:parent?._id})}>{post.isPending?"Posting…":"Post response"}</button></div>{post.isError&&<p className="formError">{post.error?.response?.data?.message || "Response could not be posted."}</p>}</> : <p className="signInPrompt"><Link to="/login">Sign in</Link> to join this discussion.</p>}
    </div>{!roots.length?<Empty title="Start the conversation." text="Be the first club member to respond."/>:roots.map(comment=><Comment key={comment._id} comment={comment} replies={repliesFor(comment._id)} onReply={setParent}/>)}</div></>}
  </section>;
}

function Comment({comment,replies,onReply}) { const removed=comment.status==="removed"; return <article className="comment"><Avatar author={comment.author}/><div><header><strong>{comment.author?.fullName || comment.author?.username || "Club member"}</strong><time>{new Date(comment.createdAt).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</time></header><p className={removed?"removed":""}>{removed?"This response was removed by a moderator.":comment.body}</p>{!removed&&<button onClick={()=>onReply(comment)}>Reply</button>}{replies.map(reply=><div className="nestedReply" key={reply._id}><Avatar author={reply.author}/><div><header><strong>{reply.author?.fullName || reply.author?.username || "Club member"}</strong><time>{new Date(reply.createdAt).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</time></header><p className={reply.status==="removed"?"removed":""}>{reply.status==="removed"?"This reply was removed by a moderator.":reply.body}</p></div></div>)}</div></article> }
function Avatar({author}) { const name=author?.fullName||author?.username||"C"; return <span className="clubAvatar">{author?.picture?<img src={author.picture} alt=""/>:name.charAt(0).toUpperCase()}</span> }

function Play({items,loading}) { return <section className="clubhousePanel"><div className="panelHeading"><div><span>CALL THE SHOT</span><h2>Back your tennis instinct</h2></div><p>One answer per challenge. Make it count.</p></div>{loading?<Loading/>:!items.length?<Empty title="Next challenge warming up." text="New quizzes and polls will appear here."/>:<div className="challengeGrid">{items.map(item=><Challenge item={item} key={item._id}/>)}</div>}</section> }
function Challenge({item}) { const [result,setResult]=useState(null); const [error,setError]=useState(""); const vote=useMutation({mutationFn:respondToEngagement,onSuccess:setResult,onError:err=>setError(err.response?.data?.message||"Your answer could not be recorded.")}); const total=result?result.result.options.reduce((sum,o)=>sum+o.votes,0):item.totalResponses; return <article className={`challengeCard ${item.kind}`}><header><span>{item.kind}</span><small>{total} {total===1?"response":"responses"}</small></header><p>{item.kicker}</p><h3>{item.question}</h3><div className="options">{(result?.result.options||item.options).map(option=>{const percentage=total?Math.round((option.votes/total)*100):0; const chosen=String(result?.result.selectedOptionId)===String(option._id); const correct=String(result?.result.correctOptionId)===String(option._id); return <button key={option._id} disabled={!!result||vote.isPending||item.status!=="published"} className={`${chosen?"chosen":""} ${correct?"correct":""}`} onClick={()=>vote.mutate({id:item._id,optionId:option._id,participantId:participantId()})}><span>{option.label}</span>{result&&<><i style={{width:`${percentage}%`}}/><strong>{percentage}%</strong></>}</button>})}</div>{result&&<p className="resultNote">{result.message} {result.result.explanation}</p>}{error&&<p className="formError">{error}</p>}</article> }
function Empty({title,text}) { return <div className="clubEmpty"><span>ATP</span><h3>{title}</h3><p>{text}</p></div> }
function Loading() { return <div className="clubLoading"><i/><span>Preparing the court…</span></div> }
