import mongoose from "mongoose";
import NewsArticle from "../src/routes/news/model";

const articles = [
  {
    title: "ATP Abuja weekend ladder returns to the court",
    slug: "test-atp-abuja-weekend-ladder",
    excerpt: "Players across the ATP community are getting ready for another social but competitive weekend ladder.",
    category: "Community",
    author: "ATP Editorial",
    imageUrl: "/IMG_2807.jpg",
    body: "<p>The ATP Abuja weekend ladder is back, giving amateur players a friendly way to test their game, meet new opponents and build match confidence.</p><h2>What players can expect</h2><ul><li>Competitive matches grouped by playing level</li><li>Opportunities to meet new hitting partners</li><li>Match feedback from the ATP coaching team</li></ul><blockquote>Bring your racquet, your best energy and a willingness to compete.</blockquote><p>Full fixture information will be shared with registered players before play begins.</p>",
    published: true,
  },
  {
    title: "Three simple habits for a more reliable serve",
    slug: "test-three-habits-reliable-serve",
    excerpt: "A repeatable routine, a relaxed toss and a balanced finish can make your serve more dependable under pressure.",
    category: "Coaching",
    author: "ATP Coaching Team",
    imageUrl: "/IMG_2807.jpg",
    body: "<p>A powerful serve helps, but reliability wins more points at amateur level. Start by making these three habits part of every practice session.</p><h2>Build the same routine</h2><ol><li>Set your feet before bouncing the ball.</li><li>Choose your target before beginning the motion.</li><li>Hold your finish long enough to check your balance.</li></ol><p>Practice each habit at half speed before adding power. Consistency grows from movements you can repeat.</p>",
    published: true,
  },
  {
    title: "Inside an ATP community training session",
    slug: "test-inside-atp-community-training",
    excerpt: "A look at how drills, point play and shared feedback come together during ATP group training.",
    category: "Inside ATP",
    author: "ATP Editorial",
    imageUrl: "/IMG_2807.jpg",
    body: "<p>Every ATP group session combines purposeful repetition with the energy of playing alongside people who love tennis.</p><h2>From warm-up to point play</h2><p>Players begin with movement and control drills, progress into pattern-based exercises, and finish by applying the day’s focus in live points.</p><p>The aim is simple: leave the court with one clear improvement you can carry into your next match.</p>",
    published: true,
  },
];

const mongoUri = Bun.env.MONGO_URI;
if (!mongoUri) throw new Error("MONGO_URI is not configured");

await mongoose.connect(mongoUri);
for (const article of articles) {
  await NewsArticle.findOneAndUpdate(
    { slug: article.slug },
    { ...article, publishedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
console.log(`Seeded ${articles.length} local test news articles.`);
await mongoose.disconnect();
