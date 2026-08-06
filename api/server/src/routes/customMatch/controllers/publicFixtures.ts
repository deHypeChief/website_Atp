import Elysia from "elysia";
import mongoose from "mongoose";
import { CustomMatch } from "../model";
import User from "../../user/model";

/**
 * Friendly fixtures for the public score ticker.
 *
 * Shows what is coming up and what has just been played. History is capped at a week
 * because the ticker is a "what's happening" strip, not an archive — the full record
 * lives on each player's matches page.
 */

const HISTORY_DAYS = 7;

const startOfDay = (date: Date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

/** "Today" / "Yesterday" / "Saturday" — how the ticker labels each fixture. */
const dayLabel = (when: Date | null, today: Date) => {
    if (!when) return "Date TBC";
    const days = Math.round((startOfDay(when).getTime() - today.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === -1) return "Yesterday";
    if (days === 1) return "Tomorrow";
    return when.toLocaleDateString("en-GB", { weekday: "long" });
};

const publicFixtures = new Elysia()
    .get("/matchCustom/fixtures", async ({ set }) => {
        try {
            const today = startOfDay(new Date());
            const historyFrom = new Date(today.getTime() - HISTORY_DAYS * 86400000);

            // A fixture counts as "recent" by when it was played, falling back to when it
            // was last touched for older records that never got a scheduled date.
            const fixtures = await CustomMatch.find({
                status: { $ne: "draft" },
                $or: [
                    { scheduledAt: { $gte: historyFrom } },
                    { scheduledAt: { $in: [null, undefined] }, updatedAt: { $gte: historyFrom } },
                ],
            }).sort({ scheduledAt: -1, updatedAt: -1 }).limit(40).lean();

            const playerIds = [...new Set(fixtures.flatMap(fixture => fixture.participants.map(p => p.userId)))];
            const players = await User.find({ _id: { $in: playerIds.filter(id => mongoose.isValidObjectId(id)) } })
                .select("fullName username")
                .lean();
            const nameById = new Map(players.map(player => [
                player._id.toString(),
                player.fullName || player.username || "ATP player",
            ]));

            const items = fixtures.map(fixture => {
                const when = fixture.scheduledAt ? new Date(fixture.scheduledAt) : null;
                const participants = fixture.participants.map(participant => ({
                    name: nameById.get(String(participant.userId)) || "ATP player",
                    score: participant.score ?? null,
                    winner: Boolean(participant.winner),
                }));

                return {
                    id: fixture._id.toString(),
                    status: fixture.status,
                    matchType: fixture.matchType,
                    venue: fixture.venue || "",
                    scheduledAt: when,
                    day: dayLabel(when, today),
                    time: when
                        ? when.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
                        : "",
                    played: fixture.status === "completed",
                    participants,
                };
            });

            set.headers["cache-control"] = "public, max-age=30";
            return { fixtures: items };
        } catch (error) {
            console.error("Error loading friendly fixtures:", error);
            set.status = 500;
            return { message: "Error loading friendly fixtures" };
        }
    });

export default publicFixtures;
