import mongoose from "mongoose";

interface ISubscription {
    user: mongoose.Types.ObjectId;
    membership: {
        status: "Not Paid" | "Paid" | "Expired";
        plan: "monthly" | "quarterly" | "yearly" | "none";
        autoRenew: boolean;
        endDate: Date;
        gracePeriod: Date; // Added grace period for membership
    }
    training: {
        status: "Not Paid" | "Paid" | "Expired";
        // Slug of an admin managed training package, or "none" while nothing is active.
        plan: string;
        endDate: Date;
        gracePeriod: Date; // Added grace period for membership
    };
    cardAuthToken: string;
    paymentHistory: {
        type: string;
        date: Date;
        amount: number;
        status: "paid" | "failed" | "pending";
        transactionRef: string;
    }[];
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membership: {
        status: { type: String, default: "Not Paid" },
        plan: { type: String, enum: ["monthly", "quarterly", "yearly", "none"], required: true },
        autoRenew: { type: Boolean, defualut: false },
        endDate: { type: Date },
        gracePeriod: { type: Date } // Added grace period for membership
    },
    training: {
        status: { type: String, default: "Not Paid" },
        // No enum: packages are created in the admin, so the set of valid slugs is not fixed.
        plan: { type: String, default: "none" },
        endDate: { type: Date },
        gracePeriod: { type: Date } // Added grace period for training
    },
    cardAuthToken: { type: String },
    paymentHistory: [{
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ["paid", "failed", "pending"], required: true },
        transactionRef: { type: String, required: true }
    }]
});

const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export { ISubscription, Subscription };
