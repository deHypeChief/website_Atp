import mongoose from "mongoose";
import { connectDb } from "../src/config/db.config";
import Engagement from "../src/routes/engagement/model";
import { CommunityTopic } from "../src/routes/community/model";

await connectDb();

const challenges = [
  {
    kind: "poll", kicker: "This weekend's call", question: "Which surface produces the most complete tennis player?", status: "published", featured: true,
    options: [{ label: "Hard court" }, { label: "Clay" }, { label: "Grass" }],
  },
  {
    kind: "quiz", kicker: "Know your game", question: "What is the minimum number of points needed to win a standard tie-break?", status: "published",
    explanation: "A standard tie-break is first to seven points, with a two-point margin.",
    options: [{ label: "Five", isCorrect: false }, { label: "Seven", isCorrect: true }, { label: "Ten", isCorrect: false }],
  },
];
for (const challenge of challenges) await Engagement.updateOne({ question: challenge.question }, { $setOnInsert: challenge }, { upsert: true });

const discussions = [
  { title: "What separates a good competitor from a great one?", prompt: "Is it technique, preparation, composure—or something else? Share the moment you think reveals a player's competitive level.", tag: "Player mindset", status: "published", pinned: true },
  { title: "The match you would watch again from the first serve", prompt: "Choose one match, professional or local, and tell the clubhouse why it stayed with you.", tag: "Match memories", status: "published" },
];
for (const discussion of discussions) await CommunityTopic.updateOne({ title: discussion.title }, { $setOnInsert: discussion }, { upsert: true });

console.log("Seeded two challenges and two community discussions.");
await mongoose.disconnect();
