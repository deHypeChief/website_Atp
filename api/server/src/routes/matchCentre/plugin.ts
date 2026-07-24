import Elysia, { t } from "elysia";
import mongoose from "mongoose";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import Match from "../match/model";
import Tournament from "../tournament/model";
import MatchCentre from "./model";

const populateDraw = (query: any) => query
  .populate("tournament", "name category location date time")
  .populate("matches.playerOne", "fullName username level")
  .populate("matches.playerTwo", "fullName username level");

const scoreMatchBody = t.Object({
  playerOne: t.String(),
  playerTwo: t.String(),
  court: t.String(),
  status: t.Union([t.Literal("scheduled"), t.Literal("live"), t.Literal("finished")]),
  scoreOne: t.Array(t.Number()),
  scoreTwo: t.Array(t.Number()),
});

const drawBody = t.Object({
  stage: t.String(),
  status: t.Union([t.Literal("upcoming"), t.Literal("live"), t.Literal("completed")]),
  published: t.Boolean(),
  matches: t.Array(scoreMatchBody),
});

const publicMatchCentre = new Elysia()
  .get("/live", async ({ set }) => {
    try {
      const draws = await populateDraw(
        MatchCentre.find({ published: true, "matches.0": { $exists: true } }).sort({ updatedAt: -1 }),
      ).lean();
      return { draws };
    } catch (error) {
      console.error("Error loading match centre:", error);
      set.status = 500;
      return { message: "Unable to load the match centre", draws: [] };
    }
  });

const adminMatchCentre = new Elysia({ prefix: "/admin" })
  .use(isAdmin_Authenticated)
  .get("/", async ({ set }) => {
    try {
      const tournaments = await Tournament.find().sort({ date: -1 }).lean();
      const tournamentIds = tournaments.map((tournament) => tournament._id);
      const [registrations, draws] = await Promise.all([
        Match.find({ tournament: { $in: tournamentIds } })
          .populate("user", "fullName username email level")
          .lean(),
        populateDraw(MatchCentre.find({ tournament: { $in: tournamentIds } })).lean(),
      ]);

      const playersByTournament: Record<string, any[]> = {};
      for (const registration of registrations as any[]) {
        const tournamentId = String(registration.tournament);
        if (!registration.user) continue;
        if (!playersByTournament[tournamentId]) playersByTournament[tournamentId] = [];
        const exists = playersByTournament[tournamentId].some((player) => String(player._id) === String(registration.user._id));
        if (!exists) playersByTournament[tournamentId].push(registration.user);
      }

      return {
        tournaments: tournaments.map((tournament) => ({
          ...tournament,
          registeredPlayers: playersByTournament[String(tournament._id)] || [],
        })),
        draws,
      };
    } catch (error) {
      console.error("Error loading admin match centre:", error);
      set.status = 500;
      return { message: "Unable to load tournament desk", tournaments: [], draws: [] };
    }
  })
  .put("/:tournamentId", async ({ body, params: { tournamentId }, set }) => {
    try {
      if (!mongoose.isValidObjectId(tournamentId)) {
        set.status = 400;
        return { message: "Invalid tournament" };
      }

      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        set.status = 404;
        return { message: "Tournament not found" };
      }

      const registrations = await Match.find({ tournament: tournamentId }).select("user").lean();
      const registeredIds = new Set(registrations.map((registration) => String(registration.user)));

      for (const match of body.matches) {
        if (!mongoose.isValidObjectId(match.playerOne) || !mongoose.isValidObjectId(match.playerTwo)) {
          set.status = 400;
          return { message: "Every pairing must use valid players" };
        }
        if (match.playerOne === match.playerTwo) {
          set.status = 400;
          return { message: "A player cannot play against themselves" };
        }
        if (!registeredIds.has(match.playerOne) || !registeredIds.has(match.playerTwo)) {
          set.status = 400;
          return { message: "Pairings can only include registered tournament players" };
        }
      }

      const cleanMatches = body.matches.map((match) => ({
        ...match,
        court: match.court.trim() || "FT",
        scoreOne: match.scoreOne.map((score) => Math.max(0, Math.trunc(score))),
        scoreTwo: match.scoreTwo.map((score) => Math.max(0, Math.trunc(score))),
      }));

      const draw = await populateDraw(MatchCentre.findOneAndUpdate(
        { tournament: tournamentId },
        {
          $set: {
            tournament: tournamentId,
            stage: body.stage.trim() || "Main draw",
            status: body.status,
            published: body.published,
            matches: cleanMatches,
          },
        },
        { upsert: true, new: true, runValidators: true },
      ));

      return { message: body.published ? "Match centre published" : "Match centre draft saved", draw };
    } catch (error) {
      console.error("Error saving match centre:", error);
      set.status = 500;
      return { message: "Unable to save match centre" };
    }
  }, { body: drawBody })
  .delete("/:tournamentId", async ({ params: { tournamentId }, set }) => {
    try {
      await MatchCentre.findOneAndDelete({ tournament: tournamentId });
      return { message: "Match centre draw removed" };
    } catch (error) {
      console.error("Error removing match centre:", error);
      set.status = 500;
      return { message: "Unable to remove match centre draw" };
    }
  });

const matchCentrePlugin = new Elysia({ prefix: "/match-centre" })
  .use(publicMatchCentre)
  .use(adminMatchCentre);

export default matchCentrePlugin;
