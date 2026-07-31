# Cloudflare R2 Image Storage

Admin image uploads (news articles, coaches, store products, plans, tournaments, site
content) are stored in a Cloudflare R2 bucket instead of on the API server's disk.

- `src/config/r2.config.ts` — R2 client and helpers, shared by any route that needs storage.
- `src/routes/uploads/plugin.ts` — `POST /uploads/image` and `DELETE /uploads/image`, admin-only.
- Admin panel calls these through `api/admin/src/hooks/use-cloudinary.ts`.

Uploads are proxied through the API server, so the browser never talks to R2 directly and
no bucket CORS rules are needed.

## 1. Create the bucket

Requires an R2 API token with **Admin Read & Write** — object-scoped tokens cannot manage
buckets. In the Cloudflare dashboard: **R2 → Manage R2 API Tokens → Create Account API
token → Admin Read & Write**.

Put the token value in `api/server/.env.local` (gitignored):

```
CLOUDFLARE_API_TOKEN=<the admin token value>
CLOUDFLARE_ACCOUNT_ID=<your account id>
```

Then, from `api/server`:

```bash
bunx wrangler r2 bucket create atp-images --location=weur --env-file .env.local
```

`weur` is the closest location hint to Nigeria — R2 has no African hint. Change it if the
audience is elsewhere: `wnam`, `enam`, `eeur`, `apac`, `oc`.

## 2. Enable the public URL

```bash
bunx wrangler r2 bucket dev-url enable atp-images --env-file .env.local
```

This prints the bucket's `https://pub-<hash>.r2.dev` address, which is the value for
`CLOUDFLARE_R2_PUBLIC_URL`. Run `bunx wrangler r2 bucket dev-url get atp-images` to read it
again later.

> **This is a development URL.** Cloudflare rate-limits `r2.dev` to hundreds of requests per
> second, throttles bandwidth, and does not support it for production traffic. Before
> launch, attach a custom domain (**R2 → bucket → Settings → Custom Domains**), point
> `CLOUDFLARE_R2_PUBLIC_URL` at it, and disable the dev URL. Existing image URLs stored in
> MongoDB contain the old host, so plan that switch before real content is uploaded.

## 3. Give the API server its own credentials

The server only needs to read and write objects, so use a separate, narrower token rather
than the admin one: **R2 → Manage R2 API Tokens → Create Account API token → Object Read &
Write**, scoped to `atp-images`. Copy the **Access Key ID** and **Secret Access Key** — the
secret is shown only once.

Fill these in `api/server/.env`:

```
CLOUDFLARE_R2_ACCOUNT_ID=<your account id>
CLOUDFLARE_R2_ACCESS_KEY_ID=<object token access key id>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<object token secret access key>
CLOUDFLARE_R2_BUCKET_NAME=atp-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

No trailing slash on `CLOUDFLARE_R2_PUBLIC_URL`. Until all five are set to real values the
server logs a warning on boot and `/uploads/image` returns `503`.

## 4. Verify

Restart the API (`bun run api` from the repo root) — the R2 warning should be gone. Then
upload an image from the admin panel, or:

```bash
curl -X POST http://localhost:3002/uploads/image -H "Authorization: Bearer <admin jwt>" -F "image=@some.jpg"
```

A successful response is `{ "message": "Image uploaded", "imageUrl": "...", "key": "..." }`,
and the `imageUrl` should load in a browser. `bunx wrangler r2 object get atp-images/<key>`
confirms the object landed.

## Notes

- Object keys are `atp/<YYYY-MM-DD>/<uuid>.<ext>` — random, so uploads never overwrite each
  other, and served with `Cache-Control: public, max-age=31536000, immutable`.
- Accepted types are JPG, PNG, WebP and GIF, up to 10 MB.
- `DELETE /uploads/image` takes `{ "key": "..." }` or `{ "imageUrl": "..." }`. URLs outside
  the configured public base are rejected, so it cannot be used to delete arbitrary keys.
  Nothing calls it yet — replacing an image in the admin panel leaves the old object in the
  bucket.
