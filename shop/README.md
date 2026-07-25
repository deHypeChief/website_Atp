# ATP Royal

ATP Royal is the dedicated ATP International ecommerce frontend. It uses the existing store API and ATP player accounts while keeping merchandise routes out of the main client app.

## Local development

From the repository root, run `bun run dev`. ATP Royal opens on `http://localhost:3003`, the client app on `http://localhost:3000`, the API on `http://localhost:3002`, and admin on `http://localhost:3001`.

The Vite development server proxies `/api` to the local API, so local shop requests do not require an extra CORS origin.

## Deployment variables

- Shop: `VITE_SERVER_API` is the public API URL; `VITE_CLIENT_URL` is the ATP client URL; `VITE_SHOP_URL` is the ATP Royal URL.
- Client: `VITE_SHOP_URL` is the ATP Royal URL used by banners, navigation and the secure authentication handoff.
- API: `SHOP_ORIGIN` is the ATP Royal origin used for Paystack callbacks. When the shop calls the API cross-origin, include that origin in `ALLOWED_ORIGINS`.

Shop login and signup go through the ATP client. The client only hands the session back to the configured ATP Royal callback origin, and direct client login still routes to `/u`.
