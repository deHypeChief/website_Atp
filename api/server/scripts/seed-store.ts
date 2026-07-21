import mongoose from "mongoose";
import Product from "../src/routes/store/product.model";

const sampleImage=`${(Bun.env.ACTIVE_ORIGIN || "http://localhost:3000").replace(/\/$/,"")}/IMG_2807.jpg`;
const products=[
 {name:"ATP Performance Cap",slug:"atp-performance-cap",category:"Apparel",description:"A lightweight court cap with an adjustable fit for sunny training sessions.",price:18000,stock:24,images:[sampleImage],active:true},
 {name:"Club Training Tee",slug:"club-training-tee",category:"Apparel",description:"Breathable ATP training tee made for drills, match play and warm Abuja afternoons.",price:28000,stock:18,images:[sampleImage],active:true},
 {name:"ATP Match Balls — 3 Pack",slug:"atp-match-balls-3-pack",category:"Equipment",description:"A fresh three-ball can for club matches, coaching sessions and weekend hitting.",price:9500,stock:40,images:[sampleImage],active:true},
 {name:"Court Essentials Bag",slug:"court-essentials-bag",category:"Bags",description:"A compact carry bag for racquets, grips, balls and the essentials you bring to court.",price:45000,stock:8,images:[sampleImage],active:true},
];
const uri=Bun.env.MONGO_URI;if(!uri)throw new Error("MONGO_URI is not configured");await mongoose.connect(uri);
for(const product of products)await Product.findOneAndUpdate({slug:product.slug},product,{upsert:true,new:true,setDefaultsOnInsert:true});
console.log(`Seeded ${products.length} local ATP store products.`);await mongoose.disconnect();
