/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { getMyStoreOrders } from "../../libs/api/api.endpoints";
import { PlayerEmpty, PlayerLoading, PlayerPageHeader } from "../../components/system/player-system";
import "../../libs/styles/orders-v4.css";

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;
const normalizedStatus = (order) => (order.status || order.paymentStatus || "Processing").toString();
const formatDate = (value) => value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
    : "Date unavailable";

function OrderRecord({ order }) {
    const status = normalizedStatus(order);
    const itemCount = (order.items || []).reduce((count, item) => count + Number(item.quantity || 1), 0);
    const itemSummary = (order.items || []).map((item) => `${item.quantity || 1}× ${item.name || "ATP product"}`).join(", ") || "ATP shop order";
    const address = typeof order.delivery?.address === "string" ? order.delivery.address : "Delivery details saved";

    return <article className="orderRecordV4">
        <header>
            <div><small>Order reference</small><strong>{order.orderNumber || order._id?.slice(-8) || "ATP order"}</strong></div>
            <span className={`orderStatusV4 ${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span>
        </header>
        <div className="orderRecordBody">
            <div className="orderRecordMain"><span>{formatDate(order.createdAt)}</span><h2>{itemSummary}</h2></div>
            <div className="orderRecordTotal"><small>Order total</small><strong>{money(order.total)}</strong></div>
        </div>
        <footer>
            <span><Icon icon="solar:bag-4-linear" />{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <span><Icon icon="solar:card-linear" />Payment: {order.paymentStatus || "Pending"}</span>
            <span><Icon icon="solar:map-point-linear" />{address}</span>
        </footer>
    </article>;
}

export default function OrdersPage() {
    const { data: orders = [], isLoading, isError } = useQuery({ queryKey: ["my-store-orders"], queryFn: getMyStoreOrders });
    const [filter, setFilter] = useState("All orders");
    const filters = useMemo(() => ["All orders", ...new Set(orders.map(normalizedStatus))], [orders]);
    const visibleOrders = filter === "All orders" ? orders : orders.filter((order) => normalizedStatus(order) === filter);
    const paidOrders = orders.filter((order) => (order.paymentStatus || "").toLowerCase() === "paid").length;
    const totalSpent = orders.reduce((total, order) => total + Number(order.total || 0), 0);

    return <main className="playerUtility ordersPageV4">
        <PlayerPageHeader eyebrow="ATP club shop" title="Order desk" text="Track every club-shop purchase from payment through fulfilment." action={<Link className="ordersShopLink" to="/shop">Shop equipment <Icon icon="solar:arrow-right-up-linear" /></Link>} />
        {isLoading ? <PlayerLoading text="Loading your orders…" /> : isError ? <PlayerEmpty icon="solar:danger-circle-linear" title="Orders are unavailable." text="We could not load your order history. Refresh the page to try again." /> : !orders.length ? <PlayerEmpty icon="solar:bag-cross-linear" title="Your order list is empty." text="Court essentials and ATP club pieces are waiting in the shop." to="/shop" label="Shop products" /> : <>
            <section className="orderMetricsV4" aria-label="Order summary">
                <article><Icon icon="solar:box-linear" /><div><small>All orders</small><strong>{String(orders.length).padStart(2, "0")}</strong></div></article>
                <article><Icon icon="solar:verified-check-linear" /><div><small>Paid orders</small><strong>{String(paidOrders).padStart(2, "0")}</strong></div></article>
                <article><Icon icon="solar:wallet-money-linear" /><div><small>Total value</small><strong>{money(totalSpent)}</strong></div></article>
            </section>
            <section className="orderArchiveV4">
                <header><div><small>Purchase history</small><h2>Your order archive</h2></div><nav aria-label="Filter orders by status">{filters.map((status) => <button key={status} type="button" className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status}</button>)}</nav></header>
                <div className="orderRecordsV4">{visibleOrders.map((order) => <OrderRecord key={order._id || order.orderNumber} order={order} />)}</div>
            </section>
        </>}
    </main>;
}
