import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: { type:String, required:true, unique:true },
  user: { type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
  items: [{
    product: { type:mongoose.Schema.Types.ObjectId, ref:"Product", required:true },
    name: String, image: String, price: Number, quantity: Number,
  }],
  subtotal: { type:Number, required:true },
  total: { type:Number, required:true },
  delivery: { name:String, phone:String, address:String },
  paymentReference: { type:String, required:true, unique:true },
  paymentStatus: { type:String, enum:["Pending","Paid","Failed"], default:"Pending" },
  status: { type:String, enum:["Awaiting payment","Processing","Shipped","Delivered","Cancelled"], default:"Awaiting payment" },
  paidAt: Date,
}, { timestamps:true });

export default mongoose.model("StoreOrder", orderSchema);
