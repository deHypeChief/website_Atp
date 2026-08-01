import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import { isUser_Authenticated } from "../../middleware/isUserAuth";
import { CommunityComment, CommunityTopic } from "./model";
import { sendNotifications } from "../notifications/service";

const publicCommunity = new Elysia()
  .get("/topics", async ({ query }) => {
    const participantId = ((query as { participantId?: string }).participantId || "").trim().slice(0, 128);
    const topics = await CommunityTopic.find({ status: { $in: ["published", "locked"] } })
      .select("+likedBy")
      .populate("author", "fullName username picture")
      .sort({ pinned: -1, lastActivityAt: -1 })
      .lean();
    const previews = await Promise.all(topics.map(topic => CommunityComment.find({ topic: topic._id, status: "visible" })
      .select("body author createdAt")
      .populate("author", "fullName username picture")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()));
    return {
      topics: topics.map(({ likedBy = [], ...topic }, index) => ({
        ...topic,
        likeCount: topic.likeCount || 0,
        viewCount: topic.viewCount || 0,
        hasLiked: Boolean(participantId && likedBy.includes(participantId)),
        previewComments: previews[index],
      })),
    };
  })
  .get("/topics/:id", async ({ params: { id }, query, set }) => {
    const viewerId = ((query as { viewerId?: string }).viewerId || "").trim().slice(0, 128);
    let topic = viewerId ? await CommunityTopic.findOneAndUpdate(
      { _id: id, status: { $in: ["published", "locked"] }, viewers: { $ne: viewerId } },
      { $addToSet: { viewers: viewerId }, $inc: { viewCount: 1 } },
      { new: true },
    ).populate("author", "fullName username picture") : null;
    if (!topic) topic = await CommunityTopic.findOne({ _id: id, status: { $in: ["published", "locked"] } }).populate("author", "fullName username picture");
    if (!topic) { set.status = 404; return { message: "Discussion not found." }; }
    const comments = await CommunityComment.find({ topic: id }).populate("author", "fullName username picture").sort({ createdAt: 1 });
    return { topic, comments: comments.map(comment => { const value = comment.toObject(); return value.status === "removed" ? { ...value, body: "" } : value; }) };
  });

const memberCommunity = new Elysia()
  .use(isUser_Authenticated)
  // Reacting is a member action: the public website shows every like but only signed-in
  // players can add one. The stored identity stays the participant id so likes recorded
  // before this route required authentication are still counted.
  .post("/topics/:id/like", async ({ params: { id }, body, set }) => {
    const participantId = ((body as { participantId?: string }).participantId || "").trim().slice(0, 128);
    if (!participantId) { set.status = 400; return { message: "Your like could not be recorded." }; }
    const topic = await CommunityTopic.findOne({ _id: id, status: { $in: ["published", "locked"] } }).select("+likedBy");
    if (!topic) { set.status = 404; return { message: "Discussion not found." }; }
    const liked = topic.likedBy.includes(participantId);
    if (liked) topic.likedBy.pull(participantId);
    else topic.likedBy.addToSet(participantId);
    topic.likeCount = topic.likedBy.length;
    await topic.save();
    return { liked: !liked, likeCount: topic.likeCount };
  })
  .post("/topics", async ({ body, user, set }) => {
    const payload = body as { title?: string; prompt?: string; tag?: string };
    const title = payload.title?.trim();
    const prompt = payload.prompt?.trim();
    if (!title || !prompt) { set.status = 400; return { message: "Add a title and something to discuss." }; }
    if (title.length > 140 || prompt.length > 2500) { set.status = 400; return { message: "Keep the title under 140 characters and the post under 2,500." }; }
    const topic = await CommunityTopic.create({ author: user._id, title, prompt, tag: payload.tag?.trim() || "Open court", status: "published" });
    await topic.populate("author", "fullName username picture");
    set.status = 201; return { message: "Post published.", topic };
  })
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

    // Tell the people whose content was engaged with. The commenter never gets notified
    // about their own comment, and replying on your own post sends one notification, not two.
    const actor = user.fullName || user.username || "An ATP member";
    const link = `/u/community?topic=${id}`;
    const notified = new Set([user._id.toString()]);
    const notifications = [];
    const parentAuthorId = parent?.author?.toString();
    if (parentAuthorId && !notified.has(parentAuthorId)) {
      notified.add(parentAuthorId);
      notifications.push({ userID: parentAuthorId, title: "New reply to your comment", message: `${actor} replied to your comment on "${topic.title}".`, category: "community" as const, link });
    }
    // Admin-created topics have no author, so there is nobody to notify.
    const topicAuthorId = topic.author?.toString();
    if (topicAuthorId && !notified.has(topicAuthorId)) {
      notifications.push({ userID: topicAuthorId, title: "New comment on your post", message: `${actor} commented on "${topic.title}".`, category: "community" as const, link });
    }
    await sendNotifications(notifications);

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
