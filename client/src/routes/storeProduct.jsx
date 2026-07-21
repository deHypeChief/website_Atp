import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getStoreProduct } from "../libs/api/api.endpoints";
import { addToCart } from "../libs/store/cart";
import "../libs/styles/store.css";
import "../libs/styles/store-product.css";

const money = value => `₦${Number(value).toLocaleString()}`;

export default function StoreProduct() {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["store-product", slug],
    queryFn: () => getStoreProduct(slug),
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (isLoading) return <main className="productDetailState">Loading product…</main>;
  if (isError || !product) return <main className="productDetailState"><h1>Product not found</h1><Link to="/shop">Return to the shop</Link></main>;

  const images = product.images?.length ? product.images : [""];
  const add = () => {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return <main className="productDetailPage">
    <nav className="productBreadcrumb" aria-label="Breadcrumb"><Link to="/shop">ATP Shop</Link><span> / </span><span>{product.name}</span></nav>
    <section className="productDetailLayout">
      <div className="productGallery">
        <div className="productMainImage">{images[selectedImage] ? <img src={images[selectedImage]} alt={product.name}/> : <strong>ATP</strong>}<span>{product.stock ? `${product.stock} in stock` : "Sold out"}</span></div>
        {images.length > 1 && <div className="productThumbnails">{images.map((image,index)=><button className={selectedImage===index?"selected":""} onClick={()=>setSelectedImage(index)} key={image}><img src={image} alt={`${product.name} view ${index+1}`}/></button>)}</div>}
      </div>
      <div className="productDetailInfo">
        <p className="productCategory">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="productPrice">{money(product.price)}</p>
        <div className="courtRule"><span></span><i></i><span></span></div>
        <p className="productDescription">{product.description}</p>
        <button className="productAddButton" disabled={!product.stock} onClick={add}>{!product.stock ? "Sold out" : added ? "Added to cart ✓" : "Add to cart"}</button>
        <Link className="productCartLink" to="/cart">View cart →</Link>
        <dl className="productFacts"><div><dt>Availability</dt><dd>{product.stock ? `${product.stock} ready to order` : "Currently unavailable"}</dd></div><div><dt>Payment</dt><dd>Secure checkout with Paystack</dd></div><div><dt>Order tracking</dt><dd>Updates inside your ATP account</dd></div></dl>
      </div>
    </section>
  </main>;
}
