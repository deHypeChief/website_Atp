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
import billing from "./routes/billings/plugin";
import webhook from "./routes/webhook.";

// Connect to the database
connectDb();
export const app = new Elysia();

// Apply middlewares and plugins
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
  .use(billing)
  .use(leader)
  .use(webhook)
  .get("/", () => "Server is Up and running 🦊")
  .listen(Bun.env.PORT || 3002);

console.log(
  `🦊 Elysia is running at ` +
  pc.yellow(`${app.server?.hostname}:${app.server?.port}`)
);




