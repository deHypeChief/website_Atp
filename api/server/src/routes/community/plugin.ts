import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import { isUser_Authenticated } from "../../middleware/isUserAuth";
import { CommunityComment, CommunityTopic } from "./model";

const publicCommunity = new Elysia()
  .get("/topics", async () => ({ topics: await CommunityTopic.find({ status: { $in: ["published", "locked"] } }).sort({ pinned: -1, lastActivityAt: -1 }) }))
  .get("/topics/:id", async ({ params: { id }, set }) => {
    const topic = await CommunityTopic.findOne({ _id: id, status: { $in: ["published", "locked"] } });
    if (!topic) { set.status = 404; return { message: "Discussion not found." }; }
    const comments = await CommunityComment.find({ topic: id }).populate("author", "fullName username picture").sort({ createdAt: 1 });
    return { topic, comments: comments.map(comment => { const value = comment.toObject(); return value.status === "removed" ? { ...value, body: "" } : value; }) };
  });

const memberCommunity = new Elysia()
  .use(isUser_Authenticated)
  .post("/topics/:id/comments", async ({ params: { id }, body, user, set }) => {
    const payload = body as { body?: string; parentId?: string };
    const text = payload.body?.trim();
    if (!text) { set.status = 400; return { message: "Write a response before posting." }; }
    const topic = await CommunityTopic.findOne({ _id: id, status: "published" });
    if (!topic) { set.status = 409; return { message: "This discussion is closed." }; }
    let parent = null;
    if (payload.parentId) { parent = await CommunityComment.findOne({ _id: payload.parentId, topic: id, status: "visible" }); if (!parent) { set.status = 400; return { message: "The reply you selected is unavailable." }; } }
    const comment = await CommunityComment.create({ topic: id, author: user._id, parent: parent?._id || null, body: text });
    topic.replyCount += 1; topic.lastActivityAt = new Date(); await topic.save();
    await comment.populate("author", "fullName username picture");
    set.status = 201; return { message: "Response posted.", comment };
  });

const adminCommunity = new Elysia({ prefix: "/admin" })
  .use(isAdmin_Authenticated)
  .get("/topics", async () => ({ topics: await CommunityTopic.find().sort({ pinned: -1, lastActivityAt: -1 }) }))
  .post("/topics", async ({ body, set }) => { try { const topic = await CommunityTopic.create(body as object); set.status = 201; return { message: "Discussion created.", topic }; } catch { set.status = 400; return { message: "Add a title and discussion prompt." }; } })
  .put("/topics/:id", async ({ params: { id }, body, set }) => { const topic = await CommunityTopic.findByIdAndUpdate(id, body as object, { new: true, runValidators: true }); if (!topic) { set.status = 404; return { message: "Discussion not found." }; } return { message: "Discussion updated.", topic }; })
  .delete("/topics/:id", async ({ params: { id }, set }) => { const topic = await CommunityTopic.findByIdAndDelete(id); if (!topic) { set.status = 404; return { message: "Discussion not found." }; } await CommunityComment.deleteMany({ topic: id }); return { message: "Discussion deleted." }; })
  .get("/comments", async () => ({ comments: await CommunityComment.find().populate("author", "fullName username email").populate("topic", "title").sort({ createdAt: -1 }).limit(250) }))
  .put("/comments/:id/status", async ({ params: { id }, body, set }) => { const status = (body as { status?: string }).status; if (!status || !["visible", "removed"].includes(status)) { set.status = 400; return { message: "Invalid moderation status." }; } const comment = await CommunityComment.findByIdAndUpdate(id, { status }, { new: true }); if (!comment) { set.status = 404; return { message: "Comment not found." }; } return { message: status === "removed" ? "Comment removed." : "Comment restored.", comment }; });

export default new Elysia({ prefix: "/community" }).use(publicCommunity).use(memberCommunity).use(adminCommunity);
