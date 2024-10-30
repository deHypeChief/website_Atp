import { Link, useLocation, useParams } from "react-router-dom";
import Button from "../../components/button/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query"
import { validateBilling } from "../../libs/api/api.endpoints";


export default function Billing() {
    const location = useLocation();
    const { planID, billingType, coachId } = useParams();
    const [isValid, setIsValid] = useState(false)

    const billingQuery = useQuery({
        queryFn: () => {
            const url = new URL(window.location.href)
            const billigUrl = `/${planID}/${billingType}/${coachId}/planCallback${url.search}`
            return validateBilling(billigUrl)
        },
        queryKey: ["validateTicket"],
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })
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
        </div>
    )
}