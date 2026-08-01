import mongoose from "mongoose";
import { connectDb } from "../src/config/db.config";
import Engagement from "../src/routes/engagement/model";
import { CommunityComment, CommunityTopic } from "../src/routes/community/model";
import User from "../src/routes/user/model";

/**
 * Fills the clubhouse with demo conversation: authored posts, threaded replies, likes and
 * poll votes, so the community feed can be reviewed with realistic content.
 *
 * Re-running is safe. Topics are matched on title and polls on question, and each run
 * rebuilds that topic's replies rather than stacking duplicates.
 *
 * Players come from seed-demo-club.ts, so run that first:
 *   bun run seed:demo-club && bun run seed:community
 */
await connectDb();

const players = await User.find({
  email: {
    $in: [
      "testplayer@example.com", "noah.daniels@example.com", "tomi.adeyemi@example.com",
      "maya.okonkwo@example.com", "dayo.ibrahim@example.com", "zara.eze@example.com",
      "femi.lawson@example.com", "leila.hassan@example.com",
    ],
  },
}).select("_id username").lean();

if (players.length < 2) {
  console.error("Not enough demo players found. Run `bun run seed:demo-club` first.");
  await mongoose.disconnect();
  process.exit(1);
}

const idByUsername = new Map(players.map(player => [player.username, player._id]));
const author = (username: string) => idByUsername.get(username) ?? players[0]._id;
// Likes are keyed on the browser participant id, not the user document, so demo reactions
// use a stable synthetic id per player.
const likerId = (username: string) => `seed-${username}`;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const discussions = [
  {
    title: "What separates a good competitor from a great one?",
    prompt: "Is it technique, preparation, composure—or something else? Share the moment you think reveals a player's competitive level.",
    tag: "Player mindset", by: "tomi_adeyemi", pinned: true, views: 184, days: 6,
    likedBy: ["noah_daniels", "maya_okonkwo", "dayo_ibrahim", "zara_eze", "leila_hassan"],
    comments: [
      { by: "maya_okonkwo", body: "The second serve at 4-5, 30-40. Everything you have practised either shows up there or it does not.", days: 5, replies: [
        { by: "tomi_adeyemi", body: "That is exactly the point I was fishing for. The shot is the same, the context is not.", days: 5 },
        { by: "noah_daniels", body: "Agreed. I started practising second serves only at the end of a session when I am already tired. It has helped a lot.", days: 4 },
      ] },
      { by: "dayo_ibrahim", body: "Recovery between points. Great competitors reset in four seconds; the rest of us carry the last error into the next rally.", days: 4, replies: [
        { by: "leila_hassan", body: "This. My coach makes me turn to the back fence after every point and it genuinely changed my matches.", days: 3 },
      ] },
      { by: "zara_eze", body: "As a newer player, the thing I notice is that the strong ones never look rushed, even when they are running.", days: 2, replies: [] },
    ],
  },
  {
    title: "The match you would watch again from the first serve",
    prompt: "Choose one match, professional or local, and tell the clubhouse why it stayed with you.",
    tag: "Match memories", by: "leila_hassan", views: 132, days: 5,
    likedBy: ["tomi_adeyemi", "femi_lawson", "maya_okonkwo"],
    comments: [
      { by: "femi_lawson", body: "The Independence Club final last season. Two hours, three tie-breaks, and nobody dropped their head once.", days: 4, replies: [
        { by: "leila_hassan", body: "I was courtside for that one. The quality of the returning in the third set was ridiculous.", days: 4 },
      ] },
      { by: "atp_test_player", body: "Any match where the underdog holds serve at 4-5 in the decider. That is the whole sport in one game.", days: 2, replies: [] },
    ],
  },
  {
    title: "Best drill for a one-handed backhand under pressure?",
    prompt: "I can hit it clean in a rally but it falls apart when I am pushed wide. What has actually worked for you?",
    tag: "Technique", by: "zara_eze", views: 96, days: 3,
    likedBy: ["dayo_ibrahim", "noah_daniels"],
    comments: [
      { by: "dayo_ibrahim", body: "Shadow swings with a towel over the shoulder. Sounds silly, fixes the early shoulder turn faster than anything else.", days: 3, replies: [
        { by: "zara_eze", body: "Trying this at Saturday training, thank you.", days: 2 },
      ] },
      { by: "maya_okonkwo", body: "Feed yourself wide balls and only aim cross-court for ten minutes. Direction control first, power later.", days: 1, replies: [] },
    ],
  },
  {
    title: "Abuja court conditions in the dry season — how do you adjust?",
    prompt: "The ball flies differently in the harmattan. String tension, ball choice, tactics — what do you change?",
    tag: "Court craft", by: "noah_daniels", views: 71, days: 2,
    likedBy: ["tomi_adeyemi", "zara_eze", "atp_test_player", "femi_lawson"],
    comments: [
      { by: "tomi_adeyemi", body: "Two extra pounds of tension and a lot more topspin margin over the net. Flat hitting is punished in that air.", days: 2, replies: [] },
      { by: "femi_lawson", body: "Fresh balls matter far more than people think. A tired can in dry air is unplayable.", days: 1, replies: [
        { by: "noah_daniels", body: "Good shout — going to start bringing a spare can to club sessions.", days: 1 },
      ] },
    ],
  },
];

for (const item of discussions) {
  const replyCount = item.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
  const likedBy = item.likedBy.map(likerId);
  const newestReply = Math.min(...item.comments.flatMap(comment => [comment.days, ...comment.replies.map(reply => reply.days)]));

  const topic = await CommunityTopic.findOneAndUpdate(
    { title: item.title },
    {
      $set: {
        author: author(item.by), prompt: item.prompt, tag: item.tag, status: "published",
        pinned: Boolean(item.pinned), replyCount, likeCount: likedBy.length, viewCount: item.views,
        likedBy, viewers: likedBy, createdAt: daysAgo(item.days), lastActivityAt: daysAgo(newestReply),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Rebuild the thread so re-running the seed does not duplicate the conversation.
  await CommunityComment.deleteMany({ topic: topic!._id });
  for (const comment of item.comments) {
    const root = await CommunityComment.create({
      topic: topic!._id, author: author(comment.by), body: comment.body, createdAt: daysAgo(comment.days),
    });
    for (const reply of comment.replies) {
      await CommunityComment.create({
        topic: topic!._id, author: author(reply.by), parent: root._id, body: reply.body, createdAt: daysAgo(reply.days),
      });
    }
  }
}

const challenges = [
  {
    kind: "poll", kicker: "This weekend's call", featured: true,
    question: "Which surface produces the most complete tennis player?",
    by: "tomi_adeyemi", days: 6, explanation: "",
    options: [{ label: "Hard court", votes: 14 }, { label: "Clay", votes: 21 }, { label: "Grass", votes: 6 }],
  },
  {
    kind: "poll", kicker: "Member poll", featured: false,
    question: "What should the club add first — evening floodlit sessions or a Saturday junior ladder?",
    by: "maya_okonkwo", days: 3, explanation: "",
    options: [{ label: "Floodlit evening sessions", votes: 18 }, { label: "Saturday junior ladder", votes: 11 }],
  },
  {
    kind: "poll", kicker: "Settle it for us", featured: false,
    question: "Singles or doubles for a Sunday morning at the club?",
    by: "femi_lawson", days: 1, explanation: "",
    options: [{ label: "Singles", votes: 9 }, { label: "Doubles", votes: 16 }, { label: "Whatever gets me on court", votes: 12 }],
  },
  {
    kind: "quiz", kicker: "Know your game", featured: false,
    question: "What is the minimum number of points needed to win a standard tie-break?",
    by: "leila_hassan", days: 4,
    explanation: "A standard tie-break is first to seven points, with a two-point margin.",
    options: [{ label: "Five", isCorrect: false, votes: 3 }, { label: "Seven", isCorrect: true, votes: 24 }, { label: "Ten", isCorrect: false, votes: 5 }],
  },
];

for (const challenge of challenges) {
  const totalResponses = challenge.options.reduce((total, option) => total + option.votes, 0);
  // Synthetic participant ids keep the recorded vote list consistent with totalResponses,
  // and none of them collide with a real browser id, so demo votes never block a real one.
  const participants = Array.from({ length: totalResponses }, (_, index) => `seed-voter-${index}`);
  await Engagement.findOneAndUpdate(
    { question: challenge.question },
    {
      $set: {
        author: author(challenge.by), kind: challenge.kind, kicker: challenge.kicker,
        explanation: challenge.explanation, status: "published", featured: challenge.featured,
        options: challenge.options, totalResponses, participants, createdAt: daysAgo(challenge.days),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

const replyTotal = discussions.reduce((total, item) => total + item.comments.reduce((sum, comment) => sum + 1 + comment.replies.length, 0), 0);
const likeTotal = discussions.reduce((total, item) => total + item.likedBy.length, 0);
console.log(`Seeded ${discussions.length} discussions with ${replyTotal} replies and ${likeTotal} likes, plus ${challenges.length} polls and quizzes.`);
await mongoose.disconnect();
