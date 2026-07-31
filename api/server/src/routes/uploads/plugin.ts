import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import { buildObjectKey, deleteFromR2, isR2Configured, r2KeyFromUrl, uploadToR2 } from "../../config/r2.config";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const extensionFor = (file: File) => {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) return fromName;
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
};

export default new Elysia({ prefix: "/uploads" })
  .use(isAdmin_Authenticated)
  .post("/image", async ({ body, set }) => {
    const file = (body as { image?: File })?.image;
    if (!(file instanceof File)) {
      set.status = 400;
      return { message: "Choose an image to upload" };
    }
    if (!allowedTypes.has(file.type)) {
      set.status = 415;
      return { message: "Upload a JPG, PNG, WebP or GIF image" };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      set.status = 413;
      return { message: "Images must be 10 MB or smaller" };
    }
    if (!isR2Configured) {
      set.status = 503;
      return { message: "Cloudflare R2 image storage is not configured" };
    }

    const key = buildObjectKey(extensionFor(file));

    try {
      const imageUrl = await uploadToR2(key, Buffer.from(await file.arrayBuffer()), file.type);
      return { message: "Image uploaded", imageUrl, key };
    } catch (error) {
      console.error("Cloudflare R2 upload failed", error);
      set.status = 502;
      return { message: "Image upload failed" };
    }
  })
  .delete("/image", async ({ body, set }) => {
    // Accepts either the stored public URL or the raw object key.
    const { imageUrl, key: rawKey } = (body ?? {}) as { imageUrl?: string; key?: string };
    const key = rawKey ?? (imageUrl ? r2KeyFromUrl(imageUrl) : null);
    if (!key) {
      set.status = 400;
      return { message: "Provide the image key or a URL from this bucket" };
    }
    if (!isR2Configured) {
      set.status = 503;
      return { message: "Cloudflare R2 image storage is not configured" };
    }

    try {
      await deleteFromR2(key);
      return { message: "Image deleted", key };
    } catch (error) {
      console.error("Cloudflare R2 delete failed", error);
      set.status = 502;
      return { message: "Image delete failed" };
    }
  });
