import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import Engagement from "./model";

const publicEngagement = new Elysia()
  .get("/", async () => ({
    items: await Engagement.find({ status: { $in: ["published", "closed"] } })
      .select("-participants -options.isCorrect")
      .sort({ featured: -1, createdAt: -1 }),
  }))
  .post("/:id/respond", async ({ params: { id }, body, set }) => {
    const { optionId, participantId } = body as { optionId?: string; participantId?: string };
    if (!optionId || !participantId) { set.status = 400; return { message: "Choose an answer before continuing." }; }
    const item = await Engagement.findOne({ _id: id, status: "published" });
    if (!item) { set.status = 404; return { message: "This question is no longer available." }; }
    if (item.closesAt && item.closesAt.getTime() < Date.now()) { set.status = 409; return { message: "This question has closed." }; }
    if (item.participants.includes(participantId)) { set.status = 409; return { message: "You have already answered this question." }; }
    const option = item.options.id(optionId);
    if (!option) { set.status = 400; return { message: "That answer is not available." }; }
    option.votes += 1;
    item.totalResponses += 1;
    item.participants.push(participantId);
    await item.save();
    return {
      message: item.kind === "quiz" ? (option.isCorrect ? "Correct answer." : "Answer recorded.") : "Vote recorded.",
      result: { selectedOptionId: optionId, correctOptionId: item.kind === "quiz" ? item.options.find(entry => entry.isCorrect)?._id : undefined, explanation: item.explanation, options: item.options.map(entry => ({ _id: entry._id, label: entry.label, votes: entry.votes })) },
    };
  });

const adminEngagement = new Elysia({ prefix: "/admin" })
  .use(isAdmin_Authenticated)
  .get("/", async () => ({ items: await Engagement.find().select("-participants").sort({ createdAt: -1 }) }))
  .post("/", async ({ body, set }) => {
    const payload = body as any;
    if (payload.kind === "quiz" && payload.options?.filter((option: any) => option.isCorrect).length !== 1) { set.status = 400; return { message: "A quiz needs exactly one correct answer." }; }
    try { const item = await Engagement.create(payload); set.status = 201; return { message: "Question created.", item }; }
    catch { set.status = 400; return { message: "Check the question and answer options." }; }
  })
  .put("/:id", async ({ params: { id }, body, set }) => {
    const payload = body as any;
    if (payload.kind === "quiz" && payload.options?.filter((option: any) => option.isCorrect).length !== 1) { set.status = 400; return { message: "A quiz needs exactly one correct answer." }; }
    try { const item = await Engagement.findByIdAndUpdate(id, payload, { new: true, runValidators: true }); if (!item) { set.status = 404; return { message: "Question not found." }; } return { message: "Question updated.", item }; }
    catch { set.status = 400; return { message: "Question could not be updated." }; }
  })
  .delete("/:id", async ({ params: { id }, set }) => { const item = await Engagement.findByIdAndDelete(id); if (!item) { set.status = 404; return { message: "Question not found." }; } return { message: "Question deleted." }; });

export default new Elysia({ prefix: "/engagement" }).use(publicEngagement).use(adminEngagement);
