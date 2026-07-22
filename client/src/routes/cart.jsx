/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createStoreCheckout } from "../libs/api/api.endpoints";
import { removeCartItem, updateCartItem, useCart } from "../libs/store/cart";
import { useAuth } from "../libs/hooks/use-auth";
import "../libs/styles/store.css";
import "../libs/styles/store-spacing.css";
import "../libs/styles/cart-professional.css";
import "../libs/styles/cart-v4.css";
import "../libs/styles/cart-v4-width.css";

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

export default function Cart() {
  const { items, total } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const [authStatus, setAuthStatus] = useState("checking");
  const [delivery, setDelivery] = useState({ name: "", phone: "", address: "" });
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const checkout = useMutation({ mutationFn: createStoreCheckout, onSuccess: (data) => { window.location.assign(data.paymentUrl); }, onError: (err) => { if (err.response?.status === 401) navigate("/login?redirect=/cart"); else setError(err.response?.data?.message || "Checkout could not be started"); } });

  useEffect(() => { let active = true; isAuthenticated().then((auth) => { if (active) setAuthStatus(auth ? "authenticated" : "guest"); }); return () => { active = false; }; }, []);
  const submit = (event) => { event.preventDefault(); if (authStatus !== "authenticated") { navigate("/login?redirect=/cart"); return; } setError(""); checkout.mutate({ items: items.map((item) => ({ productId: item._id, quantity: item.quantity })), delivery }); };

  return <main className="cartPage cartPageV4">
    <header className="cartHeroV4">
      <div><span>ATP club shop / Your bag</span><h1>Your court bag.</h1><p>Review your equipment, adjust quantities and continue securely to checkout.</p></div>
      <div><strong>{String(itemCount).padStart(2, "0")}</strong><span>{itemCount === 1 ? "item selected" : "items selected"}</span><Link to="/shop"><Icon icon="solar:arrow-left-linear" />Keep shopping</Link></div>
    </header>

    {!items.length ? <section className="emptyCart emptyCartV4"><Icon icon="solar:bag-cross-linear" /><small>Your court bag</small><h2>Your bag is waiting.</h2><p>Add a few ATP essentials before checkout.</p><Link to="/shop">Browse the shop <Icon icon="solar:arrow-right-linear" /></Link></section> : <div className="cartLayout cartLayoutV4">
      <section className="cartManifestV4">
        <header><div><small>Bag manifest</small><h2>Your equipment</h2></div><span>{itemCount} {itemCount === 1 ? "piece" : "pieces"}</span></header>
        <div className="cartItems">{items.map((item, index) => <article className="cartProduct" key={item._id}>
          <span className="cartItemIndex">{String(index + 1).padStart(2, "0")}</span>
          {item.image ? <img src={item.image} alt={item.name} /> : <div className="cartFallback">ATP</div>}
          <div className="cartProductInfo">
            <small>ATP court essential</small><h3>{item.name}</h3>
            <p className="cartUnitPrice">{money(item.price)} <span>each</span></p>
            <div className="cartProductActions">
              <div className="cartQuantity" aria-label={`${item.name} quantity`}>
                <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => item.quantity === 1 ? removeCartItem(item._id) : updateCartItem(item._id, item.quantity - 1)}>−</button>
                <span aria-live="polite">{item.quantity}</span>
                <button type="button" aria-label={`Add one ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => updateCartItem(item._id, item.quantity + 1)}>+</button>
              </div>
              <button type="button" className="cartRemove" onClick={() => removeCartItem(item._id)}>Remove</button>
            </div>
          </div>
          <div className="cartLineTotal"><small>Line total</small><strong>{money(item.price * item.quantity)}</strong></div>
        </article>)}</div>
      </section>

      <aside className="checkoutRailV4"><form className="checkoutCard" onSubmit={submit}>
        <header><span>Checkout ticket</span><Icon icon="solar:shield-check-linear" /></header>
        <div className="checkoutTotalV4"><small>Order total</small><h2>{money(total)}</h2><p>Secure payment powered by Paystack</p></div>
        {authStatus === "checking" ? <div className="checkoutAccountGate"><Icon icon="solar:refresh-circle-linear" /><strong>Checking your account…</strong></div> : authStatus === "guest" ? <div className="checkoutAccountGate"><span>Next step</span><h3>Sign in to checkout</h3><p>Your ATP account keeps payment, delivery and order updates together.</p><button type="button" onClick={() => navigate("/login?redirect=/cart")}>Sign in to continue <Icon icon="solar:arrow-right-linear" /></button><Link to="/signup?redirect=/cart">Create an ATP account</Link></div> : <div className="deliveryFieldsV4"><span>Delivery details</span><label>Full name<input required value={delivery.name} onChange={(event) => setDelivery({ ...delivery, name: event.target.value })} /></label><label>Phone number<input required type="tel" value={delivery.phone} onChange={(event) => setDelivery({ ...delivery, phone: event.target.value })} /></label><label>Delivery address<textarea required value={delivery.address} onChange={(event) => setDelivery({ ...delivery, address: event.target.value })} /></label>{error && <p className="checkoutError">{error}</p>}<button className="checkoutPayV4" disabled={checkout.isPending}>{checkout.isPending ? "Opening Paystack…" : "Pay with Paystack"}<Icon icon="solar:arrow-right-up-linear" /></button><small>Paystack opens after your order is created.</small></div>}
      </form></aside>
    </div>}
  </main>;
}
