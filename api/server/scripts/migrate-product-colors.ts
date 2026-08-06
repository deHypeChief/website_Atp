/**
 * Converts legacy product colours from plain strings to { name, stock }.
 *
 *   bun run scripts/migrate-product-colors.ts
 *
 * Products used to hold one stock number and a list of colour names. Stock is now tracked
 * per colour, and Mongoose cannot hydrate a stored string into the new subdocument, so
 * existing products must be converted before the API reads them.
 *
 * The existing total is split as evenly as possible across the colours, with the remainder
 * going to the first — the total is preserved and an admin can correct the split. Runs
 * through the raw driver so the old shape does not have to pass the new schema.
 *
 * Safe to run more than once: rows already migrated are skipped.
 */
import mongoose from "mongoose";

const uri = Bun.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not configured");

await mongoose.connect(uri);
const products = mongoose.connection.collection("products");

const legacy = await products.find({ "colors.0": { $type: "string" } }).toArray();
console.log(`${legacy.length} product(s) with legacy colours`);

for (const product of legacy) {
    const names: string[] = (product.colors as unknown[])
        .map(value => String(value || "").trim())
        .filter(Boolean);

    const total = Math.max(0, Number(product.stock) || 0);
    const each = names.length ? Math.floor(total / names.length) : 0;
    const remainder = names.length ? total - each * names.length : 0;

    const colors = names.map((name, index) => ({ name, stock: each + (index === 0 ? remainder : 0) }));

    await products.updateOne({ _id: product._id }, { $set: { colors } });
    console.log(`  ${product.name}: ${colors.map(color => `${color.name}=${color.stock}`).join(", ")}`);
}

// Products with no colours at all keep using the flat stock number; nothing to do there.
console.log("Done");
await mongoose.disconnect();
