import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyStoreOrders } from "../../libs/api/api.endpoints";
import "../../libs/styles/store.css";
import "../../libs/styles/orders-empty.css";
const money=v=>`₦${Number(v).toLocaleString()}`;
export default function OrdersPage(){const {data:orders=[],isLoading}=useQuery({queryKey:["my-store-orders"],queryFn:getMyStoreOrders});return <section className="userOrders"><header><span>ATP SHOP</span><h1>Your orders</h1><p>Track payments and fulfilment from one place.</p></header>{isLoading?<p>Loading orders…</p>:!orders.length?<div className="orderEmpty"><div><h2>No shop orders yet</h2><p>Explore ATP court essentials and place your first order.</p></div><Link to="/shop">Shop products →</Link></div>:orders.map(order=><article className="orderCard" key={order._id}><div><small>{order.orderNumber}</small><h3>{order.items.map(i=>`${i.quantity}× ${i.name}`).join(", ")}</h3><p>{new Date(order.createdAt).toLocaleDateString()}</p></div><div><strong>{money(order.total)}</strong><span className={`orderStatus ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus} · {order.status}</span></div></article>)}</section>}
