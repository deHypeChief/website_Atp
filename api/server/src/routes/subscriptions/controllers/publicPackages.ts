import Elysia from "elysia";
import { listPackages, publicPackage } from "./packageStore";

/**
 * The admin-managed packages the public membership pages are built from.
 *
 * Everything else under /billing needs a login, but a visitor has to see what is on offer
 * before they have an account, so this is deliberately open. It returns nothing a signed-in
 * player could not already read from `/billing/pay/info`.
 */
const publicPackages = new Elysia()
    .get("/packages", async ({ set }) => {
        try {
            const packages = (await listPackages()).map(publicPackage);
            // Prices change rarely, so a short cache keeps the marketing pages quick.
            set.headers["cache-control"] = "public, max-age=120";
            return { message: "Packages retrieved successfully", packages };
        } catch (error) {
            console.error("Error listing public packages:", error);
            set.status = 500;
            return { message: "Unable to load membership packages", packages: [] };
        }
    });

export default publicPackages;
