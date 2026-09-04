import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import { Subscription } from "../model";
import TrainingPackage, { slugifyPackage } from "../trainingPackage.model";
import { listPackages, TIER_MONTHS } from "./packageStore";

/** Turns whatever the admin form sent into the fields the schema accepts. */
function readPackageBody(body: any) {
    const plans = Array.isArray(body?.plans) ? body.plans : [];
    // Checkout resolves a tier by its length, so a duration may only appear once.
    const seenMonths = new Set<number>();
    const category = body?.category === "special" ? "special" : "normal";

    return {
        name: String(body?.name ?? "").trim(),
        category,
        // Which public membership page offers this package; a special one defaults to combo.
        audience: ["adult", "children", "combo"].includes(body?.audience)
            ? body.audience
            : category === "special" ? "combo" : "adult",
        coachLevels: (Array.isArray(body?.coachLevels) ? body.coachLevels : [])
            .map((level: any) => String(level ?? "").trim())
            .filter(Boolean),
        // Specific coaches offered with this package. Kept as-is (24-hex ids); when present the
        // membership builder shows only these and ignores coachLevels.
        coachIds: [...new Set((Array.isArray(body?.coachIds) ? body.coachIds : [])
            .map((coachId: any) => String(coachId ?? "").trim())
            .filter((coachId: string) => /^[a-fA-F0-9]{24}$/.test(coachId)))],
        discount: Math.min(100, Math.max(0, Number(body?.discount) || 0)),
        info: String(body?.info ?? "").trim(),
        priceInfo: String(body?.priceInfo ?? "").trim(),
        image: String(body?.image ?? "").trim(),
        order: Number(body?.order) || 0,
        active: body?.active === undefined ? true : Boolean(body?.active),
        plans: plans
            .map((plan: any, index: number) => ({
                months: Math.max(1, Math.round(Number(plan?.months)) || TIER_MONTHS[index] || index + 1),
                price: Math.max(0, Number(plan?.price) || 0),
                dollarPrice: Math.max(0, Number(plan?.dollarPrice) || 0),
            }))
            .filter((plan: any) => {
                if (seenMonths.has(plan.months)) return false;
                seenMonths.add(plan.months);
                return true;
            })
            .sort((a: any, b: any) => a.months - b.months),
    };
}

const adminAction = new Elysia()
    .use(isAdmin_Authenticated)
    .get("/pay/all", async ({ set }) => {
        try {
            const payments = await Subscription.find({}).populate("user")
            set.status = 200;
            return { payments };
        } catch (error) {
            set.status = 500;
            return { message: "Error fetching payments", error };
        }
    })
    .get("/pay/all/users/ontraning", async ({ set }) => {
        try {
            const payments = await Subscription.find({
                "training.status": "Paid"
            }).populate("user").select("user")
            set.status = 200;
            return { payments };
        } catch (error) {
            set.status = 500;
            return { message: "Error fetching payments", error };
        }
    })
    .get("/packages/admin", async ({ set }) => {
        try {
            // Hidden packages are included here so an admin can bring one back.
            return { packages: await listPackages({ includeInactive: true }) };
        } catch (error) {
            console.error("Error listing training packages", error);
            set.status = 500;
            return { message: "Error fetching training packages" };
        }
    })
    .post("/packages/admin", async ({ body, set }) => {
        const fields = readPackageBody(body);
        const slug = slugifyPackage((body as any)?.slug || fields.name);

        if (!fields.name) {
            set.status = 400;
            return { message: "Give the package a name" };
        }
        if (!slug) {
            set.status = 400;
            return { message: "The package needs a reference made of letters or numbers" };
        }
        if (!fields.plans.length) {
            set.status = 400;
            return { message: "Add at least one duration and price" };
        }

        try {
            const created = await TrainingPackage.create({ ...fields, slug });
            set.status = 201;
            return { message: "Training package created", package: created };
        } catch (error: any) {
            set.status = error?.code === 11000 ? 409 : 400;
            return {
                message: error?.code === 11000
                    ? `A package with the reference "${slug}" already exists`
                    : "The training package could not be created",
            };
        }
    })
    .put("/packages/admin/:id", async ({ params: { id }, body, set }) => {
        const fields = readPackageBody(body);

        if (!fields.name) {
            set.status = 400;
            return { message: "Give the package a name" };
        }
        if (!fields.plans.length) {
            set.status = 400;
            return { message: "Add at least one duration and price" };
        }

        try {
            // The slug is deliberately not editable: past Paystack references and every
            // subscriber already sitting on `training.plan` point at the current one.
            const updated = await TrainingPackage.findByIdAndUpdate(id, fields, { new: true, runValidators: true });
            if (!updated) {
                set.status = 404;
                return { message: "Training package not found" };
            }
            return { message: "Training package updated", package: updated };
        } catch (error) {
            console.error("Error updating training package", error);
            set.status = 400;
            return { message: "The training package could not be updated" };
        }
    })
    .delete("/packages/admin/:id", async ({ params: { id }, set }) => {
        try {
            const removed = await TrainingPackage.findByIdAndDelete(id);
            if (!removed) {
                set.status = 404;
                return { message: "Training package not found" };
            }

            // Members who already paid keep their plan; only new checkouts are affected.
            const onPackage = await Subscription.countDocuments({ "training.plan": removed.slug, "training.status": "Paid" });
            return { message: "Training package deleted", package: removed, activeSubscribers: onPackage };
        } catch (error) {
            console.error("Error deleting training package", error);
            set.status = 500;
            return { message: "The training package could not be deleted" };
        }
    })

export default adminAction
