import { useQuery } from '@tanstack/react-query'
import { getUserTrans } from '../../libs/api/api.endpoints'

export function BillingHistory() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["trans"],
        queryFn: getUserTrans
    });
    function truncateMiddle(text, start = 6, end = 6) {
        if (text.length <= start + end) return text;
        return `${text.slice(0, start)}...${text.slice(-end)}`;
    }
    if (isLoading) return <p>Loading billing history...</p>;
    if (isError) return <p>Failed to load billing history.</p>;

    return (
        <div className="coContent">
            <div className="header">
                <h1>Billing History</h1>
                <p>List of your payments made on the platform</p>
            </div>

            <div className="his">
                {data?.trans?.length === 0 ? (
                    <div
                        style={{
                            padding: "2rem",
                            marginTop: "1.5rem",
                            textAlign: "center",
                            border: "2px dashed #ccc",
                            borderRadius: "12px",
                            backgroundColor: "#f9f9f9",
                            color: "#555"
                        }}
                    >
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>
                            No transactions yet.
                        </p>
                        <small
                            style={{
                                display: "block",
                                marginTop: "0.5rem",
                                color: "#888",
                                fontStyle: "italic"
                            }}
                        >
                            Once you make a payment, it will appear here.
                        </small>
                    </div>
                ) : (
                    data.trans.slice().reverse().map((item) => (
                        <div className="hisBox" key={item._id}>
                            <div> {truncateMiddle(item._id)}</div>
                            <div>{item.type}</div>
                            <div> ₦{item.amount.toLocaleString()}</div>
                            <div>
                                <span
                                    style={{
                                        padding: "4px 8px",
                                        borderRadius: "8px",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        textTransform: "capitalize",
                                        color: "#fff",
                                        backgroundColor:
                                            item.status.toLowerCase() === "Complete"
                                                ? "#4caf50" // Green
                                                : item.status.toLowerCase() === "Pending"
                                                    ? "#ff9800" // Orange
                                                    : item.status.toLowerCase() === "failed"
                                                        ? "#f44336" // Red
                                                        : "#607d8b" // Default: blue-grey
                                    }}
                                >
                                    {item.status}
                                </span>
                            </div>

                            <div> {new Date(item.date).toLocaleString()}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
