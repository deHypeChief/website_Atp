/**
 * Uploads a local file to Cloudflare R2 and prints its public URL.
 *
 * For large site assets — video especially — that would otherwise sit in client/public and
 * be copied into every build and into git history. Reads the same CLOUDFLARE_R2_* values the
 * API uses, so anything it uploads is served from the bucket the site already serves images from.
 *
 *   bun run scripts/upload-media.ts <file> <object-key> [content-type]
 *
 * Keys are cached immutably, so give a replacement a new key rather than reusing one.
 */
import { isR2Configured, uploadToR2 } from "../src/config/r2.config";

const [, , sourcePath, key, contentType = "video/mp4"] = Bun.argv;

if (!sourcePath || !key) {
    console.error("Usage: bun run scripts/upload-media.ts <file> <object-key> [content-type]");
    process.exit(1);
}
if (!isR2Configured) {
    console.error("Cloudflare R2 is not configured — check the CLOUDFLARE_R2_* values in api/server/.env");
    process.exit(1);
}

const file = Bun.file(sourcePath);
if (!(await file.exists())) {
    console.error(`No file at ${sourcePath}`);
    process.exit(1);
}

const bytes = Buffer.from(await file.arrayBuffer());
console.log(`Uploading ${(bytes.length / 1024 / 1024).toFixed(2)} MB as ${contentType} to ${key}…`);

console.log(await uploadToR2(key, bytes, contentType));
