import { useState } from "react"
import Button from "../../components/button/button"
import "../../libs/styles/ticket.css"
import { Link, useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query"
import { validateMatch } from "../../libs/api/api.endpoints";

export default function YourTicket() {
    const location = useLocation();
    const { tournamentID } = useParams();
    const [isValid, setIsValid] = useState(false)

    const matchQuery = useQuery({
        queryFn: () => {
            const params = new URLSearchParams(location.search);

            const matchQueryString = `?status=${params.get('status')}&tx_ref=${params.get('tx_ref')}&transaction_id=${params.get('transaction_id')}`;
            return validateMatch(tournamentID, matchQueryString)
        },
        queryKey: ["validateTicket"],
        refetchOnWindowFocus: false
    })

    return (
        <>
            <div className="ticketWrap">
                {
                    matchQuery.isSuccess && (
                        <div className="ticketplaceValid">
                            <h1>{matchQuery.data.message}</h1>
                            <p>You can check your mail to see your ticket code</p>
                            <Link to="/u">
                                <Button>View Ticket</Button>
                            </Link>
                            <p>Note: Ticket code would be needed at the tournament</p>
                        </div>
                    )
                }
                {
                    matchQuery.isError && (
                        <div className="ticketplaceValid">
                            <h1>{matchQuery.error.message}</h1>
                            <p>Sorry Payment for the ticket could not go through</p>

                            <Link to="/u">
                                <Button>Back to Dashboard</Button>
                            </Link>
                        </div>
                    )
                }
            </div>

        </>
    )
}