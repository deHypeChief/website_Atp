import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Values that are still the placeholders shipped in .env count as "not configured",
// otherwise uploads fail against Cloudflare with a confusing signature error.
const readEnv = (name: string) => {
    const value = process.env[name]?.trim();
    if (!value || value.includes('replace_with') || value.includes('replace-with-your')) return undefined;
    return value;
};

const accountId = readEnv('CLOUDFLARE_R2_ACCOUNT_ID');
const accessKeyId = readEnv('CLOUDFLARE_R2_ACCESS_KEY_ID');
const secretAccessKey = readEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY');

export const r2Bucket = readEnv('CLOUDFLARE_R2_BUCKET_NAME');
export const r2PublicBaseUrl = readEnv('CLOUDFLARE_R2_PUBLIC_URL')?.replace(/\/+$/, '');
export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey && r2Bucket && r2PublicBaseUrl);

// R2 speaks the S3 API. `region: auto` is required — R2 has no regions.
const r2 = isR2Configured
    ? new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! }
    })
    : null;

if (!isR2Configured) {
    console.warn('Cloudflare R2 is not configured — image uploads will be rejected. See api/server/R2_SETUP.md');
}

/** Public URL an object key is served from, via the bucket's public domain. */
export const r2PublicUrl = (key: string) => `${r2PublicBaseUrl}/${key}`;

/** Reverse of `r2PublicUrl`. Returns null for URLs that are not ours, so callers cannot delete arbitrary keys. */
export const r2KeyFromUrl = (url: string) => {
    if (!r2PublicBaseUrl || !url.startsWith(`${r2PublicBaseUrl}/`)) return null;
    const key = url.slice(r2PublicBaseUrl.length + 1).split('?')[0];
    return key ? decodeURIComponent(key) : null;
};

/** Object keys are date-partitioned and random, so uploads never overwrite each other. */
export const buildObjectKey = (extension: string, folder = 'atp') =>
    `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

export const uploadToR2 = async (key: string, body: Buffer, contentType: string) => {
    if (!r2) throw new Error('Cloudflare R2 is not configured');

    await r2.send(new PutObjectCommand({
        Bucket: r2Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Keys are unique per upload, so objects are safe to cache forever.
        CacheControl: 'public, max-age=31536000, immutable'
    }));

    return r2PublicUrl(key);
};

export const deleteFromR2 = async (key: string) => {
    if (!r2) throw new Error('Cloudflare R2 is not configured');

    await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: key }));
};

export default r2;
