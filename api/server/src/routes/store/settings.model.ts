import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  key: { type:String, unique:true, default:"primary" },
  name: { type:String, default:"ATP Royal", trim:true },
  announcement: { type:String, default:"Complimentary Abuja delivery on orders over ₦75,000", trim:true },
  heroEyebrow: { type:String, default:"ATP Royal / Collection 01", trim:true },
  heroTitle: { type:String, default:"Dress for the next point.", trim:true },
  heroSubtitle: { type:String, default:"Court-built essentials and club pieces for the way you play, train and move.", trim:true },
  heroImage: { type:String, default:"", trim:true },
  primaryCta: { type:String, default:"Shop the collection", trim:true },
  secondaryCta: { type:String, default:"Explore court gear", trim:true },
  deliveryNote: { type:String, default:"Abuja delivery in 1–2 working days. Nationwide delivery in 3–5 working days.", trim:true },
  returnsNote: { type:String, default:"Easy exchanges on unworn items within 7 days.", trim:true },
}, { timestamps:true });

export default mongoose.model("StoreSettings", storeSettingsSchema);
