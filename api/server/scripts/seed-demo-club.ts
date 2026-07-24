import mongoose from "mongoose";
import User from "../src/routes/user/model";
import Coach from "../src/routes/coach/model";
import Tournament from "../src/routes/tournament/model";
import Match from "../src/routes/match/model";
import CoachAssignment from "../src/routes/coachAssigments/model";
import MatchCentre from "../src/routes/matchCentre/model";

const mongoUri = Bun.env.MONGO_URI;
if (!mongoUri) throw new Error("MONGO_URI is not configured");

const demoPassword = "ATPdemo123!";

const playerSeeds = [
  { fullName: "ATP Test Player", username: "atp_test_player", email: "testplayer@example.com", phoneNumber: "+2348000000000", level: "Beginner" },
  { fullName: "Noah Daniels", username: "noah_daniels", email: "noah.daniels@example.com", phoneNumber: "+2348010000001", level: "Intermediate" },
  { fullName: "Tomi Adeyemi", username: "tomi_adeyemi", email: "tomi.adeyemi@example.com", phoneNumber: "+2348010000002", level: "Advanced" },
  { fullName: "Maya Okonkwo", username: "maya_okonkwo", email: "maya.okonkwo@example.com", phoneNumber: "+2348010000003", level: "Intermediate" },
  { fullName: "Dayo Ibrahim", username: "dayo_ibrahim", email: "dayo.ibrahim@example.com", phoneNumber: "+2348010000004", level: "Advanced" },
  { fullName: "Zara Eze", username: "zara_eze", email: "zara.eze@example.com", phoneNumber: "+2348010000005", level: "Beginner" },
  { fullName: "Femi Lawson", username: "femi_lawson", email: "femi.lawson@example.com", phoneNumber: "+2348010000006", level: "Intermediate" },
  { fullName: "Leila Hassan", username: "leila_hassan", email: "leila.hassan@example.com", phoneNumber: "+2348010000007", level: "Advanced" },
];

const coachSeeds = [
  {
    coachName: "Coach Adewale Bello",
    email: "adewale.bello@example.com",
    level: "Player development",
    bioInfo: "A technical coach focused on repeatable strokes, confident movement and match-ready habits.",
    imageUrl: "/IMG_2807.jpg",
    avgRate: 4.9,
  },
  {
    coachName: "Coach Nneka Obi",
    email: "nneka.obi@example.com",
    level: "Performance",
    bioInfo: "A competition coach who builds clear patterns, resilient decision-making and point construction.",
    imageUrl: "/IMG_2807.jpg",
    avgRate: 4.8,
  },
  {
    coachName: "Coach Seyi Martins",
    email: "seyi.martins@example.com",
    level: "Foundation",
    bioInfo: "A patient foundation coach helping newer players find sound technique and a lasting love of tennis.",
    imageUrl: "/IMG_2807.jpg",
    avgRate: 4.7,
  },
];

const tournamentSeeds = [
  { name: "ATP International Open", category: "ATP 250", location: "National Stadium, Lagos", date: new Date("2026-07-24T09:00:00+01:00"), time: "9:00 AM", tournamentImgURL: "/IMG_2807.jpg", price: "12000" },
  { name: "Lagos Summer Challenge", category: "Club Series", location: "Ikoyi Club 1938", date: new Date("2026-08-15T10:00:00+01:00"), time: "10:00 AM", tournamentImgURL: "/IMG_2807.jpg", price: "8500" },
  { name: "Atlantic Doubles Cup", category: "Doubles", location: "Lagos Lawn Tennis Club", date: new Date("2026-09-05T08:30:00+01:00"), time: "8:30 AM", tournamentImgURL: "/IMG_2807.jpg", price: "10000" },
  { name: "Independence Club Finals", category: "Championship", location: "National Stadium, Lagos", date: new Date("2026-10-03T09:00:00+01:00"), time: "9:00 AM", tournamentImgURL: "/IMG_2807.jpg", price: "15000" },
];

async function upsertPlayer(seed: (typeof playerSeeds)[number]) {
  let player = await User.findOne({ email: seed.email });
  if (!player) {
    player = await User.create({
      ...seed,
      password: demoPassword,
      dob: new Date("1996-06-15"),
    });
  } else {
    player.set({
      fullName: seed.fullName,
      username: seed.username,
      phoneNumber: seed.phoneNumber,
      level: seed.level,
    });
    await player.save();
  }
  return player;
}

await mongoose.connect(mongoUri);

try {
  const coaches = await Promise.all(
    coachSeeds.map((seed) => Coach.findOneAndUpdate(
      { email: seed.email },
      { $set: seed },
      { upsert: true, new: true, runValidators: true },
    )),
  );

  const tournaments = await Promise.all(
    tournamentSeeds.map((seed) => Tournament.findOneAndUpdate(
      { name: seed.name },
      { $set: seed },
      { upsert: true, new: true, runValidators: true },
    )),
  );

  const players = [];
  for (const seed of playerSeeds) players.push(await upsertPlayer(seed));

  for (let index = 0; index < players.length; index += 1) {
    const player = players[index];
    const coach = coaches[index % coaches.length];

    await CoachAssignment.findOneAndUpdate(
      { playerId: player._id },
      { $set: { playerId: player._id, coachId: coach._id, status: "Assigned" } },
      { upsert: true, new: true, runValidators: true },
    );
    await User.updateOne({ _id: player._id }, { $set: { assignedCoach: coach._id } });

    const tournamentIndexes = [index % tournaments.length, (index + 1) % tournaments.length];
    for (let registration = 0; registration < tournamentIndexes.length; registration += 1) {
      const tournament = tournaments[tournamentIndexes[registration]];
      await Match.findOneAndUpdate(
        { tournament: tournament._id, user: player._id },
        {
          $setOnInsert: {
            tournament: tournament._id,
            user: player._id,
            tourCheck: true,
            flutterPaymentId: `demo-${index + 1}-${registration + 1}`,
            won: index === 0 && registration === 0,
            medal: index === 0 && registration === 0 ? "gold" : "null",
            token: `ATP-D${String(index + 1).padStart(2, "0")}${registration + 1}`,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
    }
  }

  await MatchCentre.findOneAndUpdate(
    { tournament: tournaments[0]._id },
    {
      $set: {
        tournament: tournaments[0]._id,
        stage: "Centre court",
        status: "live",
        published: true,
        matches: [
          { playerOne: players[0]._id, playerTwo: players[3]._id, court: "C1", status: "live", scoreOne: [6, 4, 3], scoreTwo: [4, 6, 2] },
          { playerOne: players[4]._id, playerTwo: players[7]._id, court: "FT", status: "finished", scoreOne: [7, 6], scoreTwo: [5, 4] },
        ],
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  await MatchCentre.findOneAndUpdate(
    { tournament: tournaments[1]._id },
    {
      $set: {
        tournament: tournaments[1]._id,
        stage: "Quarter-finals",
        status: "live",
        published: true,
        matches: [
          { playerOne: players[1]._id, playerTwo: players[5]._id, court: "C2", status: "live", scoreOne: [5, 6, 1], scoreTwo: [7, 3, 0] },
          { playerOne: players[0]._id, playerTwo: players[4]._id, court: "FT", status: "finished", scoreOne: [6, 7], scoreTwo: [3, 5] },
        ],
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  console.log(`Demo club ready: ${players.length} players, ${coaches.length} coaches, ${tournaments.length} tournaments, ${players.length * 2} registrations, 2 published draws.`);
  console.log("Current test account assigned: testplayer@example.com → Coach Adewale Bello → ATP International Open + Lagos Summer Challenge.");
} finally {
  await mongoose.disconnect();
}
