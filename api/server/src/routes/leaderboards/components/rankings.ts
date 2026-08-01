import Elysia from "elysia";
import Match from "../../match/model";
import { CustomMatch } from "../../customMatch/model";
import User from "../../user/model";

/**
 * Player standings.
 *
 * Points come from the two places a player can score at ATP:
 *   - a tournament podium finish, worth the medal values below;
 *   - a friendly (custom) match, worth whatever score the admin recorded for that player.
 *
 * Adjust MEDAL_POINTS to re-weight tournaments against friendlies; nothing else in the file
 * assumes particular values.
 */
const MEDAL_POINTS: Record<string, number> = { gold: 100, silver: 70, bronze: 50 };

type Row = {
  userId: string;
  points: number;
  tournamentPoints: number;
  friendlyPoints: number;
  wins: number;
  gamesPlayed: number;
  medals: { gold: number; silver: number; bronze: number };
  /** When the player arrived at their current total — the final tie-breaker. */
  reachedAt: Date | null;
};

const blankRow = (userId: string): Row => ({
  userId,
  points: 0,
  tournamentPoints: 0,
  friendlyPoints: 0,
  wins: 0,
  gamesPlayed: 0,
  medals: { gold: 0, silver: 0, bronze: 0 },
  reachedAt: null,
});

// Only events that actually added points move this marker: a player who scores nothing in a
// later match still "reached" their total at the earlier one.
const recordScoringEvent = (row: Row, at: Date | null | undefined) => {
  if (!at) return;
  if (!row.reachedAt || at > row.reachedAt) row.reachedAt = at;
};

const rankings = new Elysia()
  .get("/rankings", async ({ set }) => {
    try {
      const rows = new Map<string, Row>();
      const rowFor = (userId: string) => {
        const existing = rows.get(userId);
        if (existing) return existing;
        const created = blankRow(userId);
        rows.set(userId, created);
        return created;
      };

      // Tournament entries. Every paid entry is a game played; a medal is a win.
      const tournamentEntries = await Match.find().select("user medal _id").lean();
      for (const entry of tournamentEntries) {
        if (!entry.user) continue;
        const row = rowFor(entry.user.toString());
        row.gamesPlayed += 1;
        const medalPoints = MEDAL_POINTS[entry.medal as string];
        if (!medalPoints) continue;
        row.wins += 1;
        row.points += medalPoints;
        row.tournamentPoints += medalPoints;
        row.medals[entry.medal as "gold" | "silver" | "bronze"] += 1;
        // Match has no timestamps, but the ObjectId carries the moment it was created.
        recordScoringEvent(row, entry._id.getTimestamp());
      }

      // Friendly matches only count once the result is in.
      const friendlies = await CustomMatch.find({ status: "completed" }).select("participants updatedAt createdAt").lean();
      for (const match of friendlies) {
        const at = (match.updatedAt || match.createdAt) as Date | undefined;
        for (const participant of match.participants || []) {
          if (!participant.userId) continue;
          const row = rowFor(String(participant.userId));
          row.gamesPlayed += 1;
          if (participant.winner) row.wins += 1;
          const score = Number(participant.score) || 0;
          if (!score) continue;
          row.points += score;
          row.friendlyPoints += score;
          recordScoringEvent(row, at);
        }
      }

      const players = await User.find({ _id: { $in: [...rows.keys()] } })
        .select("fullName username picture level")
        .lean();
      const playerById = new Map(players.map(player => [player._id.toString(), player]));

      const standings = [...rows.values()]
        // A row can outlive its user (deleted account); those are dropped rather than shown blank.
        .filter(row => playerById.has(row.userId))
        .map(row => {
          const losses = Math.max(0, row.gamesPlayed - row.wins);
          return {
            ...row,
            losses,
            // Rounded to one decimal so the column stays readable; ordering uses this value.
            averagePoints: row.gamesPlayed ? Math.round((row.points / row.gamesPlayed) * 10) / 10 : 0,
            player: playerById.get(row.userId),
          };
        })
        // Points first, then the columns shown on the board, then whoever got there first.
        .sort((a, b) =>
          b.points - a.points ||
          b.wins - a.wins ||
          a.losses - b.losses ||
          b.averagePoints - a.averagePoints ||
          b.gamesPlayed - a.gamesPlayed ||
          (a.reachedAt?.getTime() ?? Infinity) - (b.reachedAt?.getTime() ?? Infinity) ||
          String(a.player?.fullName || a.player?.username || "").localeCompare(String(b.player?.fullName || b.player?.username || "")),
        )
        .map((row, index) => ({
          ...row,
          rank: index + 1,
          // Only a player who has actually scored can stand on the podium.
          medal: row.points > 0 && index < 3 ? (["gold", "silver", "bronze"][index] as string) : null,
        }));

      return { message: "Rankings found", rankings: standings, medalPoints: MEDAL_POINTS };
    } catch (err) {
      console.error("Error building rankings", err);
      set.status = 500;
      return { message: "Error while building the leaderboard" };
    }
  });

export default rankings;
