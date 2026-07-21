import { Elysia } from "elysia";
import pc from "picocolors";
import { connectDb } from "./config/db.config";
import admin from "./routes/admin/plugin";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { allowedOrigins } from "./config/origin.config";
import user from "./routes/user/plugin";
import tour from "./routes/tournament/plugin";
import match from "./routes/match/plugin";
import coach from "./routes/coach/plugin";
import notify from "./routes/notifications/plugin";
import { membershipJob } from "./middleware/cronJob";
import cron from "./routes/jobs/plugin";
import leader from "./routes/leaderboards/plugin";
import webhook from "./routes/webhook.";
import CoachAssignmentPlugin from "./routes/coachAssigments/plugin";
import subscriptionsPlugin from "./routes/subscriptions/plugin";
import transPlugin from "./routes/transactions/plugin";
import cMatchPlugins from "./routes/customMatch/plugins";
import newsPlugin from "./routes/news/plugin";
import siteContentPlugin from "./routes/siteContent/plugin";
import storePlugin from "./routes/store/plugin";
import uploadsPlugin from "./routes/uploads/plugin";

// Connect to the database
connectDb();
export const app = new Elysia();

// Apply middlewares 
app
  .use(swagger({
    path: "/docs",
  }))
  .use(cors({ origin: allowedOrigins }))
  .use(membershipJob)
  .use(cron)
  .use(admin)
  .use(user)
  .use(tour)
  .use(match)
  .use(coach)
  .use(notify)
  .use(leader)
  .use(webhook)
  .use(CoachAssignmentPlugin)
  .use(subscriptionsPlugin)
  .use(transPlugin)
  .use(cMatchPlugins)
  .use(newsPlugin)
  .use(siteContentPlugin)
  .use(storePlugin)
  .use(uploadsPlugin)
  .get("/", () => "Server is Up and running 🦊")
  .listen(Bun.env.PORT || 3002);

console.log(
  `🦊 Elysia is running at ` +
  pc.yellow(`${app.server?.hostname}:${app.server?.port}`)
);




