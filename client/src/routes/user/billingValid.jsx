import { Link, useLocation, useParams } from "react-router-dom";
import Button from "../../components/button/button";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query"
import { validateBilling } from "../../libs/api/api.endpoints";


export default function Billing() {
    const location = useLocation();
    const { planID, billingType, coachId } = useParams();
    const [isValid, setIsValid] = useState(false)
    const hasRunRef = useRef(false);


    const billingQuery = useQuery({
        queryFn: async () => {
            if (hasRunRef.current) {
                if (billingQuery.error) throw billingQuery.error;
                return billingQuery.data;
            }

            hasRunRef.current = true;
            const url = new URL(window.location.href);
            const billingUrl = `/${planID}/${billingType}/${coachId}/planCallback${url.search}`;
            return validateBilling(billingUrl);
        },
        queryKey: ["validateTicket", planID, billingType, coachId],
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        cacheTime: 0,
    });

    return (
        <div className="ticketWrap">
            {
                billingQuery.isSuccess && (
                    <div className="ticketplaceValid">
                        <h1>{billingQuery.data.message}</h1>
                        <p>The membership has been added, check your mail for more info</p>
                        <Link to="/u">
                            <Button>Back to dashboard</Button>
                        </Link>
                        <p>Note: Ticket code would be needed at the tournament</p>
                    </div>
                )
            }
            {
                billingQuery.isError && (
                    <div className="ticketplaceValid">
                        <h1>{billingQuery.error.message}</h1>
                        <p>Mebership payment error</p>
                        <Link to="/u">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>
                )
            }
            {
                billingQuery.isLoading && (
                    <div className="ticket-place-valid">
                        <div className="loading-container">
                            <div className="loader"></div>
                            <p>Processing payment...</p>
                        </div>
                    </div>
                )}
        </div>
    )
}