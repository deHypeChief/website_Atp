import mongoose, { ObjectId } from "mongoose";

interface IBilling {
    user: ObjectId;
    isMember: boolean; 
    bills: {
        registrationBill: {
            status: string;
            date: Date;
            amount: number;
        };
        membershipBill: {
            duration: number;  // Monthly (1) or Bi-Annual (6)
            status: string;
            renewAt: Date;
            amount: number;
            gracePeriod: Date;
            discount: number;
        };
        trainingBill?: {  // Made optional in case the user isn't enrolled in training
            trainingType: string;
            status: string;
            duration: number; // Duration in months
            renewAt: Date;
            amount?: number; // Optional in case training is free
            gracePeriod: Date;
        };
    };
    billingHistory:{
        name: string;
        date: Date;
        amount: number;
        status: string;
    }[]
}


const billingSchema = new mongoose.Schema<IBilling>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isMember: {type: Boolean, default: false},
    bills: {
        registrationBill: {
            status: { type: String, default: "Not Paid"},
            date: { type: Date},
            amount: { type: Number },
        },
        membershipBill: {
            duration: { type: Number},  // Monthly (1) or Bi-Annual (6)
            status:  { type: String, default: "Not Paid"},
            renewAt: { type: Date },
            amount: { type: Number },
            gracePeriod: { type: Date },
            discount: { type: Number, default: 0 }, // Added missing discount field
        },
        trainingBill: {
            trainingType: { type: String, required: false }, // Made optional
            status:  { type: String, default: "Not Paid"},
            duration: { type: Number }, // Made optional
            renewAt: { type: Date},
            amount: { type: Number, required: false }, // Made optional
            gracePeriod: { type: Date}, // Fixed type to Date
        },
    },
    billingHistory: [
        {
            name: { type: String, required: true },
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            status: { type: String, required: true },
        },
    ],
});


const Billing = mongoose.model<IBilling>('Billing', billingSchema);
export default Billing;