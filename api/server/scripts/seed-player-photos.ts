import mongoose from "mongoose";
import { connectDb } from "../src/config/db.config";
import User from "../src/routes/user/model";

/**
 * Gives player accounts a profile photo for local testing.
 *
 * The images are club photographs cropped to square avatars and served by the client app
 * from client/public/players, so CLIENT_URL must point at wherever that app is running:
 *
 *   bun run seed:player-photos                          # http://localhost:3000
 *   CLIENT_URL=https://atp.example.com bun run seed:player-photos
 *
 * Named demo accounts always get their assigned photo. Any other account that has no photo
 * yet is filled from the same pool, so a personal test login picks one up too. Accounts that
 * already have a picture are never overwritten.
 */
await connectDb();

const base = (Bun.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
const photo = (index: number) => `${base}/players/player-${String(index).padStart(2, "0")}.jpg`;
const POOL_SIZE = 9;

const assigned: Record<string, number> = {
  "testplayer@example.com": 1,
  "noah.daniels@example.com": 2,
  "tomi.adeyemi@example.com": 3,
  "maya.okonkwo@example.com": 4,
  "dayo.ibrahim@example.com": 5,
  "zara.eze@example.com": 6,
  "femi.lawson@example.com": 7,
  "leila.hassan@example.com": 8,
};

let named = 0;
for (const [email, index] of Object.entries(assigned)) {
  const result = await User.updateOne({ email }, { $set: { picture: photo(index) } });
  if (result.matchedCount) named += 1;
}

// Everyone else without a photo, cycling through the pool so faces are not all identical.
const remaining = await User.find({
  email: { $nin: Object.keys(assigned) },
  $or: [{ picture: "" }, { picture: { $exists: false } }, { picture: null }],
}).select("_id email").lean();

for (const [index, user] of remaining.entries()) {
  await User.updateOne({ _id: user._id }, { $set: { picture: photo((index % POOL_SIZE) + 1) } });
}

console.log(`Set photos on ${named} demo player accounts and ${remaining.length} other account(s) that had none.`);
console.log(`Images are served from ${base}/players/ — re-run with CLIENT_URL set if that host changes.`);
await mongoose.disconnect();
