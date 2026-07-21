import Elysia from "elysia";
import S3 from "aws-sdk/clients/s3";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";

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
    if (file.size > 10 * 1024 * 1024) {
      set.status = 413;
      return { message: "Images must be 10 MB or smaller" };
    }

    const accountId = Bun.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = Bun.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = Bun.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucket = Bun.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicBaseUrl = Bun.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
      set.status = 503;
      return { message: "Cloudflare R2 image storage is not configured" };
    }

    const s3 = new S3({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      accessKeyId,
      secretAccessKey,
      signatureVersion: "v4",
      region: "auto",
    });
    const key = `atp/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(file)}`;

    try {
      await s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }).promise();
      return { message: "Image uploaded", imageUrl: `${publicBaseUrl}/${key}`, key };
    } catch (error) {
      console.error("Cloudflare R2 upload failed", error);
      set.status = 502;
      return { message: "Image upload failed" };
    }
  });
