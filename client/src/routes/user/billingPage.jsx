/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { billingInfo, getPayMe } from "../../libs/api/api.endpoints";
import { useState } from "react";
import Button from "../../components/button/button";
import { BillingContent, BillingContent2, BillingSummary } from "./billingSuport";

export function Billings() {
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const { data, isLoading: billingLoading } = useQuery({
        queryKey: ["billingData"],
        queryFn: () => getPayMe(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const {
        data: payData,
        isLoading: payLoading,
    } = useQuery({
        queryKey: ["payInfo"],
        queryFn: () => billingInfo(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const openSummary = (data) => {
        setPaymentData(data);
        setIsSummaryOpen(true);
    };

    if (billingLoading || payLoading) {
        return (
            <div className="loadingContainer">
                <p>Loading billing information...</p>
            </div>
        );
    }

    // Helper function to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <>
            {isSummaryOpen && (
                <BillingSummary action={setIsSummaryOpen} dataFn={paymentData} payDataRec={payData} subData={data} />
            )}

            <div className="coContent">
                <div className="header">
                    <h1>Billings</h1>
                    <p>Manage and renew your billings easily</p>
                </div>

                <div className="topWrapContent">
                    <div className="firste ebound eSplit">
                        <div className="topVV">
                            <div className="planWrap">
                                <p>Current Membership Package</p>
                                <h1>
                                    {data?.data.membership?.plan !== "none"
                                        ? data?.data.membership?.plan
                                        : "Free Plan"}
                                </h1>
                                {data?.data.membership?.plan !== "none" && (
                                    <p style={{ fontSize: ".8rem", paddingTop: "10px" }}>
                                        *Current Plan ends on {formatDate(data.data.membership?.endDate)}
                                    </p>
                                )}
                            </div>
                            <div className="actionB">
                                {data?.data.membership?.plan !== "none" && (
                                    <Button>Renew Plan</Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <BillingContent setAction={openSummary} />
                    <BillingContent2 data={payData} setAction={openSummary} userSubData={data} />

                    <div className="firste ebound eSplit">
                        <div
                            className="topVV"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <div className="planWrap">
                                <h2>Your Billing History</h2>
                                <p style={{ fontSize: ".8rem" }}>
                                    List of all payments made on ATP
                                </p>
                            </div>
                            <div className="actionB">
                                <Button>View History</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
