import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import SiteContent from "./model";
import { COPY_GROUPS, COPY_KEYS, resolveCopy } from "./copy.registry";

const getContent = () => SiteContent.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true, new: true });

// Registry keys are dotted ("home.hero.title") but MongoDB reads a dot in a $set path as a
// nested field, which would store copy.home.hero.title as a tree instead of one flat entry.
// Keys are therefore encoded on the way in and decoded on the way out; nothing outside this
// file ever sees the encoded form.
const encodeKey = (key: string) => key.replace(/\./g, "__");
const decodeKey = (key: string) => key.replace(/__/g, ".");

// Mongoose stores `copy` as a Map; the rest of the app wants a plain object.
const copyOverrides = (content: { copy?: Map<string, string> | Record<string, string> } | null) => {
  const stored = content?.copy;
  if (!stored) return {};
  const entries = stored instanceof Map ? [...stored.entries()] : Object.entries(stored as Record<string, string>);
  return Object.fromEntries(entries.map(([key, value]) => [decodeKey(key), value]));
};

const adminContent = new Elysia({ prefix: "/admin" })
  .use(isAdmin_Authenticated)
  .put("/", async ({ body }) => {
    const data = body as Record<string, unknown>;
    const content = await SiteContent.findOneAndUpdate({ key: "main" }, { $set: data }, { upsert: true, new: true, runValidators: true });
    return { message: "Site content updated", content };
  })
  .put("/copy", async ({ body, set }) => {
    const submitted = (body ?? {}) as Record<string, unknown>;
    // Only keys declared in the registry are writable, so a stale or crafted form
    // cannot fill the document with arbitrary fields.
    const updates: Record<string, string> = {};
    const rejected: string[] = [];
    for (const [key, value] of Object.entries(submitted)) {
      if (!COPY_KEYS.has(key)) { rejected.push(key); continue; }
      if (typeof value !== "string") { rejected.push(key); continue; }
      updates[`copy.${encodeKey(key)}`] = value.trim();
    }

    if (!Object.keys(updates).length) {
      set.status = 400;
      return { message: "No editable copy was submitted", rejected };
    }

    const content = await SiteContent.findOneAndUpdate({ key: "main" }, { $set: updates }, { upsert: true, new: true });
    return {
      message: "Website copy updated",
      updated: Object.keys(updates).length,
      rejected,
      copy: resolveCopy(copyOverrides(content), content?.pages as Record<string, unknown> || {}),
    };
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
  .get("/", async () => {
    const content = await getContent();
    return {
      content,
      // Every registered key, already resolved, so the client renders by lookup alone.
      copy: resolveCopy(copyOverrides(content), content?.pages as Record<string, unknown> || {}),
    };
  })
  // Drives the admin editor: what is editable, how to label it and how to render the input.
  .get("/schema", () => ({ groups: COPY_GROUPS }))
  .use(adminContent);
