import Elysia from "elysia";
import { isUser_Authenticated } from "../../middleware/isUserAuth";
import { isAdmin_Authenticated } from "../../middleware/isAdminAuth";
import { paystack } from "../../middleware/paystack";
import Product from "./product.model";
import StoreOrder from "./order.model";

const slugify=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

const customerStore = new Elysia()
  .use(isUser_Authenticated)
  .use(paystack)
  .post("/checkout", async ({ body, user, set, paystack_Transaction }) => {
    const payload=body as any; const requested=Array.isArray(payload.items)?payload.items:[];
    if(!requested.length){set.status=400;return {message:"Your cart is empty"}}
    const ids=requested.map((item:any)=>item.productId);
    const products=await Product.find({_id:{$in:ids},active:true});
    const items=[] as any[];
    for(const requestedItem of requested){
      const product=products.find(p=>String(p._id)===String(requestedItem.productId));
      const quantity=Math.max(1,Math.floor(Number(requestedItem.quantity)||1));
      if(!product){set.status=400;return {message:"A product in your cart is unavailable"}}
      if(product.stock<quantity){set.status=409;return {message:`Only ${product.stock} ${product.name} left in stock`}}
      items.push({product:product._id,name:product.name,image:product.images?.[0]||"",price:product.price,quantity});
    }
    const subtotal=items.reduce((sum,item)=>sum+(item.price*item.quantity),0);
    const reference=`ATP-STORE-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const order=await StoreOrder.create({orderNumber:`ATP-${Date.now().toString().slice(-8)}`,user:user._id,items,subtotal,total:subtotal,delivery:payload.delivery,paymentReference:reference});
    try{
      const payment=await paystack_Transaction({amount:String(subtotal*100),email:user.email,reference,callback_url:`${Bun.env.ACTIVE_ORIGIN}/store/payment/callback?orderId=${order._id}`});
      return {order,paymentUrl:payment.data.authorization_url};
    }catch(error){await StoreOrder.findByIdAndDelete(order._id);set.status=502;return {message:"Payment could not be started"}}
  })
  .get("/orders/me", async ({ user }) => ({orders:await StoreOrder.find({user:user._id}).sort({createdAt:-1})}))
  .get("/orders/:id/verify", async ({ params:{id}, query, user, set, paystack_VerifyTransaction }) => {
    const order=await StoreOrder.findOne({_id:id,user:user._id});
    if(!order){set.status=404;return {message:"Order not found"}}
    if(order.paymentStatus==="Paid")return {message:"Payment already confirmed",order};
    const reference=String((query as any).reference||"");
    if(reference!==order.paymentReference){set.status=400;return {message:"Payment reference does not match this order"}}
    const verification=await paystack_VerifyTransaction(reference);
    if(verification?.data?.status!=="success"||Number(verification.data.amount)!==order.total*100){order.paymentStatus="Failed";await order.save();set.status=400;return {message:"Payment was not successful"}}
    const productIds=order.items.map((item:any)=>item.product);
    const products=await Product.find({_id:{$in:productIds}});
    for(const item of order.items as any){const product=products.find(p=>String(p._id)===String(item.product));if(!product||product.stock<item.quantity){set.status=409;return {message:`${item.name} no longer has enough stock. Contact ATP support for assistance.`}}}
    await Product.bulkWrite((order.items as any).map((item:any)=>({updateOne:{filter:{_id:item.product,stock:{$gte:item.quantity}},update:{$inc:{stock:-item.quantity}}}})));
    order.paymentStatus="Paid";order.status="Processing";order.paidAt=new Date();await order.save();
    return {message:"Payment confirmed",order};
  });

const adminStore = new Elysia({prefix:"/admin"})
  .use(isAdmin_Authenticated)
  .get("/overview", async () => {
    const [products,orders,revenue]=await Promise.all([Product.find().sort({createdAt:-1}),StoreOrder.find().populate("user","fullName email").sort({createdAt:-1}),StoreOrder.aggregate([{$match:{paymentStatus:"Paid"}},{$group:{_id:null,total:{$sum:"$total"},count:{$sum:1}}}])]);
    return {products,orders,revenue:revenue[0]?.total||0,paidOrders:revenue[0]?.count||0};
  })
  .post("/products", async ({body,set})=>{try{const data=body as any;const product=await Product.create({...data,slug:slugify(data.slug||data.name)});set.status=201;return {message:"Product created",product}}catch(error:any){set.status=error?.code===11000?409:400;return {message:error?.code===11000?"That product slug already exists":"Product could not be created"}}})
  .put("/products/:id", async ({params:{id},body,set})=>{const data=body as any;const product=await Product.findByIdAndUpdate(id,{...data,...(data.name||data.slug?{slug:slugify(data.slug||data.name)}:{})},{new:true,runValidators:true});if(!product){set.status=404;return {message:"Product not found"}}return {message:"Product updated",product}})
  .delete("/products/:id", async ({params:{id},set})=>{const product=await Product.findByIdAndUpdate(id,{active:false},{new:true});if(!product){set.status=404;return {message:"Product not found"}}return {message:"Product archived",product}})
  .put("/orders/:id/status", async ({params:{id},body,set})=>{const status=String((body as any).status);if(!["Processing","Shipped","Delivered","Cancelled"].includes(status)){set.status=400;return {message:"Invalid order status"}}const order=await StoreOrder.findByIdAndUpdate(id,{status},{new:true});if(!order){set.status=404;return {message:"Order not found"}}return {message:"Order updated",order}});

export default new Elysia({prefix:"/store"})
  .get("/products", async ()=>({products:await Product.find({active:true}).sort({createdAt:-1})}))
  .get("/products/:slug", async ({params:{slug},set})=>{const product=await Product.findOne({slug,active:true});if(!product){set.status=404;return {message:"Product not found"}}return {product}})
  .use(customerStore).use(adminStore);
