import mongoose, { Document, ObjectId, Schema } from 'mongoose';

interface IPlan extends Document {
	planType: string;
	planName: string;
	priceInfo: string;
	description: string;
	note: string;
	planImage: string;
	planPrice: number; // leave plan price at 0 to use coach price
	filterPrams: string[]
	billingPlans: {
		billingName: string;
		interval: number; 
		currency: string;
		discountPercentage: number;
		billingPrice: number;
	}[];
}

const planSchema = new mongoose.Schema<IPlan>({
	planType: {type:String, required: true}, //cat Identifer
	planName: { type: String, required: true, unique: true },
	priceInfo: { type: String, required: true },
	description: { type: String, required: true },
	note: { type: String},
	planImage: { type: String, required: true },
	planPrice: { type: Number, default: 0},  // if this is 0 use coach price
	filterPrams: { type: [String], required: true },
	billingPlans: [
		{
			billingName: { type: String, required: true },
			interval: { type: Number, required: true },
			currency: { type: String, required: true },
			discountPercentage: { type: Number, required: true },
			billingPrice: {type: Number, required: true} // afer the calulation is done
		},
	],
});

const Plan = mongoose.model<IPlan>('Plan', planSchema);

export default Plan;