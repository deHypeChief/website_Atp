import mongoose from "mongoose";

interface ITrainingTier {
    months: number;
    price: number;
    dollarPrice: number;
}

interface ITrainingPackage {
    slug: string;
    name: string;
    category: "normal" | "special";
    discount: number;
    info: string;
    priceInfo: string;
    image: string;
    plans: ITrainingTier[];
    order: number;
    active: boolean;
}

/**
 * Slugs are stripped to letters and numbers only.
 *
 * The slug travels inside the Paystack reference (`user-training-<slug>-1months-<stamp>`)
 * and the webhook recovers the plan by splitting that string on "-". A hyphen in the slug
 * would shift every following part, so the payment would be credited to the wrong package.
 */
const slugifyPackage = (value: string) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const tierSchema = new mongoose.Schema<ITrainingTier>({
    months: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    dollarPrice: { type: Number, default: 0, min: 0 },
}, { _id: false });

const TrainingPackageSchema = new mongoose.Schema<ITrainingPackage>({
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    // "special" packages render under their own heading on the billing page.
    category: { type: String, enum: ["normal", "special"], default: "normal" },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    info: { type: String, default: "", trim: true },
    priceInfo: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    plans: { type: [tierSchema], default: [] },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true });

const TrainingPackage = mongoose.model<ITrainingPackage>("TrainingPackage", TrainingPackageSchema);

export { ITrainingPackage, ITrainingTier, TrainingPackage, slugifyPackage };
export default TrainingPackage;
