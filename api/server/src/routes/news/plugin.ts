import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import NewsArticle from "./model";

const makeSlug = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const publicNews = new Elysia()
  .get("/", async () => ({
    articles: await NewsArticle.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }),
  }))
  .get("/:slug", async ({ params: { slug }, set }) => {
    const article = await NewsArticle.findOne({ slug, published: true });
    if (!article) {
      set.status = 404;
      return { message: "News article not found" };
    }
    return { article };
  });

const adminNews = new Elysia({ prefix: "/admin" })
  .use(isAdmin_Authenticated)
  .get("/", async () => ({ articles: await NewsArticle.find().sort({ updatedAt: -1 }) }))
  .post("/", async ({ body, set }) => {
    const data = body as Record<string, unknown>;
    const title = String(data.title || "").trim();
    const slug = makeSlug(String(data.slug || title));
    if (!title || !slug || !data.excerpt || !data.body) {
      set.status = 400;
      return { message: "Title, excerpt and article content are required" };
    }
    try {
      const published = Boolean(data.published);
      const article = await NewsArticle.create({
        title,
        slug,
        excerpt: data.excerpt,
        body: data.body,
        imageUrl: data.imageUrl,
        category: data.category || "Tennis",
        author: data.author || "ATP Editorial",
        published,
        publishedAt: published ? new Date() : undefined,
      });
      set.status = 201;
      return { message: "Article created", article };
    } catch (error: any) {
      set.status = error?.code === 11000 ? 409 : 500;
      return { message: error?.code === 11000 ? "That article slug is already in use" : "Could not create article" };
    }
  })
  .put("/:id", async ({ params: { id }, body, set }) => {
    const data = body as Record<string, unknown>;
    const current = await NewsArticle.findById(id);
    if (!current) {
      set.status = 404;
      return { message: "Article not found" };
    }
    const published = Boolean(data.published);
    const article = await NewsArticle.findByIdAndUpdate(id, {
      ...data,
      slug: makeSlug(String(data.slug || data.title || current.title)),
      publishedAt: published ? (current.publishedAt || new Date()) : undefined,
    }, { new: true, runValidators: true });
    return { message: "Article updated", article };
  })
  .delete("/:id", async ({ params: { id }, set }) => {
    const article = await NewsArticle.findByIdAndDelete(id);
    if (!article) {
      set.status = 404;
      return { message: "Article not found" };
    }
    return { message: "Article deleted" };
  });

export default new Elysia({ prefix: "/news" }).use(publicNews).use(adminNews);
