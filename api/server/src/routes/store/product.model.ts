import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  slug: { type:String, required:true, unique:true, lowercase:true, trim:true },
  description: { type:String, required:true, trim:true },
  category: { type:String, default:"Gear", trim:true },
  price: { type:Number, required:true, min:0 },
  stock: { type:Number, required:true, min:0, default:0 },
  images: [{ type:String }],
  active: { type:Boolean, default:true },
}, { timestamps:true });

export default mongoose.model("Product", productSchema);
