import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import SiteContent from "./model";

const getContent = () => SiteContent.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true, new: true });

const adminContent = new Elysia({ prefix: "/admin" })
  .use(isAdmin_Authenticated)
  .put("/", async ({ body }) => {
    const data = body as Record<string, unknown>;
    const content = await SiteContent.findOneAndUpdate({ key: "main" }, { $set: data }, { upsert: true, new: true, runValidators: true });
    return { message: "Site content updated", content };
  })
  .post("/reviews", async ({ body, set }) => {
    const review = body as Record<string, unknown>;
    if (!review.name || !review.reviewContent) { set.status = 400; return { message: "Name and review are required" }; }
    const content = await getContent();
    content!.reviews.push(review as any);
    await content!.save();
    return { message: "Review added", content };
  })
  .put("/reviews/:id", async ({ params:{ id }, body, set }) => {
    const content = await getContent();
    const review = content!.reviews.id(id);
    if (!review) { set.status = 404; return { message: "Review not found" }; }
    review.set(body as Record<string, unknown>); await content!.save();
    return { message: "Review updated", content };
  })
  .delete("/reviews/:id", async ({ params:{ id }, set }) => {
    const content = await getContent();
    const review = content!.reviews.id(id);
    if (!review) { set.status = 404; return { message: "Review not found" }; }
    review.deleteOne(); await content!.save();
    return { message: "Review deleted", content };
  });

export default new Elysia({ prefix: "/site-content" })
  .get("/", async () => ({ content: await getContent() }))
  .use(adminContent);
