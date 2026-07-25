import mongoose from "mongoose";
import Product from "../src/routes/store/product.model";
import StoreSettings from "../src/routes/store/settings.model";

const products=[
 {name:"ATP Performance Cap",slug:"atp-performance-cap",category:"Accessories",collection:"Club Standard",description:"A lightweight court cap with an adjustable fit for sunny training sessions.",price:18000,compareAtPrice:22000,stock:24,colors:["Royal blue","White"],badge:"New drop",featured:true,images:["/products/accessories.png"],active:true},
 {name:"Club Training Tee",slug:"club-training-tee",category:"Apparel",collection:"Court Code",description:"Breathable ATP training tee made for drills, match play and warm Abuja afternoons.",price:28000,compareAtPrice:34000,stock:18,sizes:["S","M","L","XL"],colors:["Royal blue","Chalk white"],badge:"Player pick",featured:true,images:["/products/apparel.png"],active:true},
 {name:"ATP Match Balls — 3 Pack",slug:"atp-match-balls-3-pack",category:"Equipment",collection:"Match Day",description:"A fresh three-ball can for club matches, coaching sessions and weekend hitting.",price:9500,stock:40,badge:"Court tested",featured:true,images:["/products/equipment.png"],active:true},
 {name:"Court Essentials Bag",slug:"court-essentials-bag",category:"Accessories",collection:"Match Day",description:"A compact carry bag for racquets, grips, balls and the essentials you bring to court.",price:45000,stock:8,colors:["Ink black","Royal blue"],featured:true,images:["/products/accessories.png"],active:true},
];
const uri=Bun.env.MONGO_URI;if(!uri)throw new Error("MONGO_URI is not configured");await mongoose.connect(uri);
for(const product of products)await Product.findOneAndUpdate({slug:product.slug},product,{upsert:true,new:true,setDefaultsOnInsert:true});
await StoreSettings.findOneAndUpdate(
 {key:"primary"},
 {$set:{announcement:"Complimentary Abuja delivery on orders over ₦75,000",deliveryNote:"Abuja delivery in 1–2 working days. Nationwide delivery in 3–5 working days."}},
 {upsert:true,new:true,setDefaultsOnInsert:true},
);
console.log(`Seeded ${products.length} local ATP store products.`);await mongoose.disconnect();
