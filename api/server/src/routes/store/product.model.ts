import mongoose from "mongoose";

/**
 * A colourway and how many of it are left.
 *
 * Stock is per colour because a product routinely sells out in one colour while others
 * are still available. `product.stock` stays the total and is derived from these whenever
 * a product has colours, so every existing stock check keeps working unchanged.
 */
const colorSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  stock: { type:Number, required:true, min:0, default:0 },
}, { _id:false });

const productSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  slug: { type:String, required:true, unique:true, lowercase:true, trim:true },
  description: { type:String, required:true, trim:true },
  category: { type:String, default:"Gear", trim:true },
  collection: { type:String, default:"ATP ROYALE", trim:true },
  price: { type:Number, required:true, min:0 },
  compareAtPrice: { type:Number, min:0 },
  stock: { type:Number, required:true, min:0, default:0 },
  images: [{ type:String }],
  sizes: [{ type:String, trim:true }],
  colors: { type:[colorSchema], default:[] },
  badge: { type:String, default:"", trim:true },
  featured: { type:Boolean, default:false },
  active: { type:Boolean, default:true },
}, { timestamps:true });

export default mongoose.model("Product", productSchema);
