import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getStoreProducts } from "../libs/api/api.endpoints";
import { addToCart, removeCartItem, updateCartItem, useCart } from "../libs/store/cart";
import "../libs/styles/store.css";
import "../libs/styles/store-controls.css";

const money = value => `₦${Number(value).toLocaleString()}`;
export default function Store() {
  const { items: cartItems } = useCart();
  const { data: products = [], isLoading } = useQuery({ queryKey: ["store-products"], queryFn: getStoreProducts });
  return <main className="storePage">
    <header className="storeHero"><span>ATP CLUB SHOP</span><h1>Play ready.</h1><p>Club essentials selected for the court, training days and every match in between.</p><Link to="/cart">View your cart →</Link></header>
    <section className="productShelf">
      <div className="shelfHead"><h2>Shop the collection</h2><p>{products.length} products</p></div>
      {isLoading ? <p className="storeNotice">Loading the clubhouse…</p> : <div className="productGrid">{products.map(product => <article className="productCard" key={product._id}>
        <Link className="productImage productLink" to={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>{product.images?.[0] ? <img src={product.images[0]} alt={product.name}/> : <span>ATP</span>}<small>{product.stock ? `${product.stock} available` : "Sold out"}</small></Link>
        <div className="productInfo"><p>{product.category}</p><h3><Link className="productNameLink" to={`/shop/${product.slug}`}>{product.name}</Link></h3><div><strong>{money(product.price)}</strong>{(() => {
          const cartItem = cartItems.find(item => item._id === product._id);
          return cartItem ? <div className="productQuantity" aria-label={`${product.name} quantity`}>
            <button aria-label={`Remove one ${product.name}`} onClick={() => cartItem.quantity === 1 ? removeCartItem(product._id) : updateCartItem(product._id, cartItem.quantity - 1)}>−</button>
            <span aria-live="polite">{cartItem.quantity}</span>
            <button aria-label={`Add one ${product.name}`} disabled={cartItem.quantity >= product.stock} onClick={() => updateCartItem(product._id, cartItem.quantity + 1)}>+</button>
          </div> : <button disabled={!product.stock} onClick={() => addToCart(product)}>{product.stock ? "Add to cart" : "Sold out"}</button>;
        })()}</div></div>
      </article>)}</div>}
    </section>
  </main>;
}
