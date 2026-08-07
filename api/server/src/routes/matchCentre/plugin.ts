import Elysia, { t } from "elysia";
import mongoose from "mongoose";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import Match from "../match/model";
import Tournament from "../tournament/model";
import User from "../user/model";
import { sendNotifications } from "../notifications/service";
import MatchCentre from "./model";

const populateDraw = (query: any) => query
  .populate("tournament", "name category location date time")
  .populate("matches.playerOne", "fullName username level")
  .populate("matches.playerTwo", "fullName username level");

/**
 * What a player is told about their own pairing. Re-saving a draw is common — a score
 * correction, another round added — so a player is only notified when this string
 * changes, otherwise every save would spam the whole field.
 */
const pairingKey = (opponentId: string, court: string) => `${opponentId}|${court}`;

/** Every player in a draw, mapped to the pairing they were given. */
const pairingsByPlayer = (matches: Array<{ playerOne: any; playerTwo: any; court?: string }>) => {
  const pairings = new Map<string, { opponentId: string; court: string }>();
  for (const match of matches) {
    const one = String(match.playerOne?._id ?? match.playerOne ?? "");
    const two = String(match.playerTwo?._id ?? match.playerTwo ?? "");
    if (!one || !two) continue;
    const court = (match.court || "").trim();
    pairings.set(one, { opponentId: two, court });
    pairings.set(two, { opponentId: one, court });
  }
  return pairings;
};

/**
 * Tells players they have been drawn against someone.
 *
 * Notifying is a side effect of saving the draw, never a reason for it to fail: the draw
 * is already written by the time this runs, so any problem here is logged and swallowed.
 */
const notifyDrawnPlayers = async (
  before: Array<{ playerOne: any; playerTwo: any; court?: string }>,
  after: Array<{ playerOne: any; playerTwo: any; court?: string }>,
  { wasPublished, tournamentName, stage }: { wasPublished: boolean; tournamentName: string; stage: string },
) => {
  try {
    const previous = wasPublished ? pairingsByPlayer(before) : new Map();
    const current = pairingsByPlayer(after);

    // A draw that has just been published is news to everyone in it; an already public
    // draw only owes a notification to players whose opponent or court moved.
    const changed = [...current.entries()].filter(([playerId, pairing]) => {
      const had = previous.get(playerId);
      return !had || pairingKey(had.opponentId, had.court) !== pairingKey(pairing.opponentId, pairing.court);
    });
    if (!changed.length) return;

    const involved = [...new Set(changed.flatMap(([playerId, pairing]) => [playerId, pairing.opponentId]))];
    const players = await User.find({ _id: { $in: involved.filter(id => mongoose.isValidObjectId(id)) } })
      .select("fullName username")
      .lean();
    const nameById = new Map(players.map(player => [
      player._id.toString(),
      player.fullName || player.username || "another ATP player",
    ]));

    await sendNotifications(changed.map(([playerId, pairing]) => ({
      userID: playerId,
      title: "You have a tournament match",
      message: `You are drawn against ${nameById.get(pairing.opponentId) || "another ATP player"} in the ${stage} at ${tournamentName}.`
        + (pairing.court ? ` Court: ${pairing.court}.` : ""),
      type: "success" as const,
      category: "tournament" as const,
      link: "/u/tournaments",
    })));
  } catch (error) {
    console.error("Failed to notify drawn players", error);
  }
};

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

      // Read before the write, so a pairing can be compared with the one it replaces.
      const existing = await MatchCentre.findOne({ tournament: tournamentId }).lean();

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

      // A draft draw is not an assignment yet, so players only hear about a published one.
      if (body.published) {
        await notifyDrawnPlayers(existing?.matches || [], cleanMatches, {
          wasPublished: Boolean(existing?.published),
          tournamentName: tournament.name,
          stage: body.stage.trim() || "Main draw",
        });
      }

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
