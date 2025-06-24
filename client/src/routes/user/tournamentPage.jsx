import { useEffect, useState } from "react"
import { checkMatch, getMatches, getMe, getTour, getTourPayLink } from "../../libs/api/api.endpoints"
import Button from "../../components/button/button"
import { useQuery } from "@tanstack/react-query";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function Tournaments() {
    const [alert, setAlert] = useState(false)
    const matchMutation = useQuery({
        queryKey: ["match"],
        queryFn: () => getMatches(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
    const tour = useQuery({
        queryKey: ["tour"],
        queryFn: () => getTour(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
    const user = useQuery({
        queryKey: ["user"],
        queryFn: () => getMe(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })

    return (
        <>
            {alert && <TourPayAlert setAlert={setAlert} alert={alert} />}
            <div className="tourDiv">
                <div className="eWrap">
                    <div className="ebound ">
                        <div className="cleft">
                            <p>Next Tour,</p>
                            <h1>
                                {
                                    Array.isArray(tour?.data) && tour.data.length > 0
                                        ? tour.data[tour.data.length - 1].name
                                        : "No tours yet"
                                }
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="eWrap">
                    <div className="ebound ">
                        <div className="cleft">
                            <p>Tours Won</p>
                            <h1>{matchMutation?.data?.matchesWon}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="toursBox">
                {
                    tour.data?.length <= 0 ? (
                        <div className="noContent">
                            <div className="ebound ">
                                <div className="cleft">
                                    <h1>The ATP Tours</h1>
                                    <p>Tournaments you can join would be showed here</p>
                                </div>
                            </div>
                        </div>

                    ) : (
                        <div className="coContent">
                            <div className="header">
                                <h2>Listed Tours</h2>
                            </div>
                            <div className="tGrid">
                                {
                                    tour.data?.map((item, index) => (
                                        <div className="tCards" key={"tour" + index}>
                                            <div className="tImage"
                                                style={{
                                                    background: item.tournamentImgURL ? (`url(${item.tournamentImgURL})`) : "grey",
                                                    backgroundSize: "cover",
                                                }}
                                            ></div>
                                            <h3>
                                                {item.name}
                                            </h3>
                                            <div className="tContent">
                                                <p>Date:</p>
                                                <p>{dayjs(item.date).format("MMMM D, YYYY h:mm A")}</p>
                                            </div>
                                            <div className="tContent">
                                                <p>Price:</p>
                                                <p>NGN {item.price}</p>
                                            </div>
                                            <Button
                                                full
                                                onClick={() => {
                                                    setAlert({ ...item, userData: user })
                                                }}
                                            >Buy Ticket</Button>
                                        </div>
                                    ))
                                }

                            </div>
                        </div>
                    )
                }
            </div>
        </>
    )
}



import PropTypes from "prop-types";

function TourPayAlert({ alert, setAlert }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(false)
    useEffect(() => {
        const checkfn = async () => {
            const checkData = await checkMatch({
                tournament: alert._id,
                user: alert.userData._id
            })
            let stat = checkData.match ? true : false
            setStatus(stat)
        }
        checkfn()
    }, [])

    async function makePayment(tourId) {
        setLoading(true)
        console.log("Generateing payment")
        await getTourPayLink(tourId)
            .then((link) => {
                if (link === undefined) {
                    setLoading(false)
                    alert("Network error during payment. Try reloading the page.");
                    return;
                }
                window.location.href = link;
            })
    }

    return (
        <div className="layoutOverlay">
            {!status ? (
                <div className="layoutBase">
                    <h3>Confirm Payment</h3>
                    <p>
                        You are about to make a payment for <b>{alert.name}</b>
                        for <b>NGN {alert.price}</b>.
                    </p>

                    <div className="baseAction">
                        <Button alt onClick={() => { setAlert(false) }}>Cancel</Button>
                        <Button onClick={() => { makePayment(alert._id) }} disabled={loading}>
                            {loading ? "Processing Link..." : "Make Payment"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="layoutBase">
                    <h3>You have Paid</h3>
                    <p>
                        You have made payment for <b>{alert.name}</b>
                        at <b>NGN {alert.price}</b>.
                    </p>

                    <div className="baseAction">
                        <Button alt full onClick={() => { setAlert(false) }}>Go Back</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

TourPayAlert.propTypes = {
    alert: PropTypes.object.isRequired,
    setAlert: PropTypes.func.isRequired,
};