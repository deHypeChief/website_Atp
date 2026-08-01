import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import { isUser_Authenticated } from "../../middleware/isUserAuth";
import Engagement from "./model";

const publicEngagement = new Elysia()
  .get("/", async ({ query }) => {
    const participantId = ((query as { participantId?: string }).participantId || "").trim().slice(0, 128);
    const items = await Engagement.find({ status: { $in: ["published", "closed"] } })
      .select("-options.isCorrect")
      .populate("author", "fullName username picture")
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    return {
      items: items.map(({ participants = [], ...item }) => ({
        ...item,
        hasResponded: Boolean(participantId && participants.includes(participantId)),
      })),
    };
  });

const memberEngagement = new Elysia()
  .use(isUser_Authenticated)
  // Voting is a member action. Guests still read every question and its running tally on
  // the public clubhouse, but casting an answer needs a player account.
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
  })
  .post("/", async ({ body, user, set }) => {
    const payload = body as { question?: string; options?: Array<{ label?: string }> };
    const question = payload.question?.trim();
    const options = (payload.options || []).map(option => ({ label: option.label?.trim() })).filter(option => option.label);
    if (!question || question.length > 220) { set.status = 400; return { message: "Add a poll question under 220 characters." }; }
    if (options.length < 2 || options.length > 6) { set.status = 400; return { message: "A poll needs between two and six options." }; }
    const item = await Engagement.create({ author: user._id, kind: "poll", question, kicker: "Member poll", options, status: "published" });
    await item.populate("author", "fullName username picture");
    set.status = 201; return { message: "Poll published.", item };
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

export default new Elysia({ prefix: "/engagement" }).use(publicEngagement).use(memberEngagement).use(adminEngagement);
