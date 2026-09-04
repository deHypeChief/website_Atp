import BillingConfig from "./billingContent";
import TrainingPackage, { ITrainingTier } from "../trainingPackage.model";

/** The packages that shipped hardcoded, in the order the billing page used to show them. */
const SEED_SLUGS = ["regular", "standard", "premium", "family", "couples"] as const;
const SEED_SPECIAL = new Set(["family", "couples"]);

/** Durations the checkout offers. Index 0 is the monthly tier, index 1 the quarterly one. */
const TIER_MONTHS = [1, 3];

let seeding: Promise<void> | null = null;

/**
 * Copies the original hardcoded packages into MongoDB the first time a package is read.
 *
 * Without this an existing deployment would show an empty billing page the moment it picks
 * up this change, so the seed keeps the live prices intact until an admin edits them.
 */
async function seedOnce() {
    if (!seeding) {
        seeding = (async () => {
            if (await TrainingPackage.estimatedDocumentCount() > 0) return;
            await TrainingPackage.insertMany(SEED_SLUGS.map((slug, index) => {
                const seed = BillingConfig.packages[slug];
                return {
                    slug,
                    name: seed.name,
                    category: SEED_SPECIAL.has(slug) ? "special" : "normal",
                    // Family and couples are the packages the combo membership page was built for.
                    audience: SEED_SPECIAL.has(slug) ? "combo" : "adult",
                    coachLevels: [],
                    discount: seed.discount,
                    info: seed.info,
                    priceInfo: seed.priceInfo,
                    image: "",
                    plans: seed.plans.map((plan, tier) => ({
                        months: TIER_MONTHS[tier] ?? tier + 1,
                        price: plan.price,
                        dollarPrice: plan.dollarPrice,
                    })),
                    order: index,
                    active: true,
                };
            }), { ordered: false });
        })().catch(error => {
            // Let the next request retry rather than serving an empty page forever.
            seeding = null;
            console.error("Training package seed failed", error);
        });
    }
    await seeding;
}

/** Tiers shortest-first, so `plans[0]` stays the monthly price every caller already assumes. */
const orderTiers = (plans: ITrainingTier[] = []) => [...plans].sort((a, b) => a.months - b.months);

/** The fields a package is allowed to show outside the admin, in one place. */
const publicPackage = (item: any) => ({
    slug: item.slug,
    name: item.name,
    category: item.category,
    // Packages predating the audience field belong to the page their category implies.
    audience: item.audience || (item.category === "special" ? "combo" : "adult"),
    coachLevels: item.coachLevels || [],
    // When set, the membership builder shows only these coaches and ignores coachLevels.
    coachIds: (item.coachIds || []).map(String),
    discount: item.discount,
    info: item.info,
    priceInfo: item.priceInfo,
    image: item.image,
    plans: orderTiers(item.plans).map(({ months, price, dollarPrice }) => ({ months, price, dollarPrice })),
});

async function listPackages({ includeInactive = false } = {}) {
    await seedOnce();
    return TrainingPackage
        .find(includeInactive ? {} : { active: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();
}

/** One package by slug, or null. Used to validate a checkout before charging anyone. */
async function findPackage(slug: string) {
    await seedOnce();
    const found = await TrainingPackage.findOne({ slug: String(slug || "").toLowerCase(), active: true }).lean();
    return found ? { ...found, plans: orderTiers(found.plans) } : null;
}

/**
 * The billing config the website consumes.
 *
 * `packages` stays a slug-keyed map for the payment summary and older callers; `packageList`
 * is the ordered array the billing page renders from, and carries the image and category.
 */
async function billingConfig() {
    const list = await listPackages();

    const packageList = list.map(publicPackage);

    return {
        ...BillingConfig,
        packages: Object.fromEntries(packageList.map(item => [item.slug, item])),
        packageList,
    };
}

export { billingConfig, findPackage, listPackages, orderTiers, publicPackage, TIER_MONTHS };
