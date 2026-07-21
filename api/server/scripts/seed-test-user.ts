import mongoose from "mongoose";
import User from "../src/routes/user/model";
import Notify from "../src/routes/notifications/model";
import { Subscription } from "../src/routes/subscriptions/model";

const credentials = {
  email: "testplayer@example.com",
  password: "TestPlayer123!",
};

const mongoUri = Bun.env.MONGO_URI;
if (!mongoUri) throw new Error("MONGO_URI is not configured");
await mongoose.connect(mongoUri);

let user = await User.findOne({ email: credentials.email });
if (!user) {
  user = await User.create({
    fullName: "ATP Test Player",
    username: "atp_test_player",
    email: credentials.email,
    password: credentials.password,
    phoneNumber: "+2348000000000",
    dob: new Date("1995-01-15"),
    level: "Beginner",
  });
} else {
  user.password = credentials.password;
  await user.save();
}

await Subscription.findOneAndUpdate({ user:user._id }, {
  $setOnInsert: {
    user:user._id,
    membership:{ status:"Not Paid", plan:"none", autoRenew:false },
    training:{ status:"Not Paid", plan:"none" },
    paymentHistory:[],
  },
}, { upsert:true });

await Notify.findOneAndUpdate({ userID:user._id, title:"Test account ready" }, {
  $setOnInsert:{ userID:user._id, title:"Test account ready", message:"This local account is ready for ATP testing.", type:"info" },
}, { upsert:true });

if (!await user.comparePassword(credentials.password)) throw new Error("Test password verification failed");
const subscription = await Subscription.findOne({ user:user._id });
if (!subscription) throw new Error("Test subscription setup failed");
console.log(`Test user ready and verified: ${credentials.email}`);
await mongoose.disconnect();
