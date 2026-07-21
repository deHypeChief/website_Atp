import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createStoreCheckout } from "../libs/api/api.endpoints";
import { removeCartItem, updateCartItem, useCart } from "../libs/store/cart";
import { useAuth } from "../libs/hooks/use-auth";
import "../libs/styles/store.css";
import "../libs/styles/store-spacing.css";
import "../libs/styles/cart-professional.css";

const money = value => `₦${Number(value).toLocaleString()}`;
export default function Cart() {
  const { items, total } = useCart(); const navigate = useNavigate(); const [error,setError]=useState("");
  const { isAuthenticated } = useAuth();
  const [authStatus,setAuthStatus]=useState("checking");
  const [delivery,setDelivery]=useState({name:"",phone:"",address:""});
  const checkout=useMutation({mutationFn:createStoreCheckout,onSuccess:data=>{window.location.assign(data.paymentUrl)},onError:err=>{if(err.response?.status===401) navigate("/login?redirect=/cart"); else setError(err.response?.data?.message||"Checkout could not be started")}});
  useEffect(()=>{let active=true;isAuthenticated().then(auth=>{if(active)setAuthStatus(auth?"authenticated":"guest")});return()=>{active=false}},[]);
  const submit=e=>{e.preventDefault();if(authStatus!=="authenticated"){navigate("/login?redirect=/cart");return}setError("");checkout.mutate({items:items.map(item=>({productId:item._id,quantity:item.quantity})),delivery})};
  return <main className="cartPage"><div className="cartTitle"><span>YOUR COURT BAG</span><h1>Confirm your order</h1><Link to="/shop">← Continue shopping</Link></div>
    {!items.length ? <section className="emptyCart"><h2>Your bag is waiting.</h2><p>Add a few ATP essentials before checkout.</p><Link to="/shop">Browse the shop</Link></section> : <div className="cartLayout"><section className="cartItems">{items.map(item=><article className="cartProduct" key={item._id}>
        {item.image?<img src={item.image} alt={item.name}/>:<div className="cartFallback">ATP</div>}
        <div className="cartProductInfo">
          <h3>{item.name}</h3>
          <p className="cartUnitPrice">{money(item.price)} <span>each</span></p>
          <div className="cartProductActions">
            <div className="cartQuantity" aria-label={`${item.name} quantity`}>
              <button type="button" aria-label={`Remove one ${item.name}`} onClick={()=>item.quantity===1?removeCartItem(item._id):updateCartItem(item._id,item.quantity-1)}>−</button>
              <span aria-live="polite">{item.quantity}</span>
              <button type="button" aria-label={`Add one ${item.name}`} disabled={item.quantity>=item.stock} onClick={()=>updateCartItem(item._id,item.quantity+1)}>+</button>
            </div>
            <button type="button" className="cartRemove" onClick={()=>removeCartItem(item._id)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/></svg><span>Remove</span></button>
          </div>
        </div>
        <div className="cartLineTotal"><small>Item total</small><strong>{money(item.price*item.quantity)}</strong></div>
      </article>)}</section>
      <form className="checkoutCard" onSubmit={submit}><p>ORDER TOTAL</p><h2>{money(total)}</h2><span>Secure payment powered by Paystack</span>{authStatus==="checking"?<div className="checkoutAccountGate"><strong>Checking your account…</strong></div>:authStatus==="guest"?<div className="checkoutAccountGate"><span>ACCOUNT REQUIRED</span><h3>Sign in to checkout</h3><p>Your account keeps your payment and delivery updates together.</p><button type="button" onClick={()=>navigate("/login?redirect=/cart")}>Sign in to continue</button><Link to="/signup?redirect=/cart">Create an ATP account</Link></div>:<><h3>Delivery details</h3><input required placeholder="Full name" value={delivery.name} onChange={e=>setDelivery({...delivery,name:e.target.value})}/><input required placeholder="Phone number" value={delivery.phone} onChange={e=>setDelivery({...delivery,phone:e.target.value})}/><textarea required placeholder="Delivery address" value={delivery.address} onChange={e=>setDelivery({...delivery,address:e.target.value})}/>{error&&<p className="checkoutError">{error}</p>}<button disabled={checkout.isPending}>{checkout.isPending?"Opening Paystack…":"Pay with Paystack"}</button><small>Paystack opens only after your signed-in order is created.</small></>}</form></div>}
  </main>;
}
