import { QRCodeCanvas } from "qrcode.react"
import { useState } from "react"
import Button from "../../components/button/button"
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { useQuery } from "@tanstack/react-query";
import { getMatches } from "../../libs/api/api.endpoints";

dayjs.extend(relativeTime);

export default function Tickets({ actions }) {
    const [alert, setAlert] = useState(false)
    const matchMutation = useQuery({
        queryKey: ["match"],
        queryFn: () => getMatches()
    })

    function PayAlert() {
        return (
            <div className="layoutOverlay">
                <div className="layoutBase">
                    <div className="tickeCode">
                        <div className="imgCode">
                            <QRCodeCanvas value={JSON.stringify(alert)} size={200} />
                        </div>
                    </div>
                    <h3>{alert.token}</h3>
                    <div className="ticketInfo">
                        <div className="tContent">
                            <p>Name:</p>
                            <p>{alert.tournament.name}</p>
                        </div>
                        <div className="tContent">
                            <p>Date:</p>
                            <p>{dayjs(alert.tournament.date).format("MMMM DD, YYYY hh:mm A")}</p>
                        </div>
                        <div className="tContent">
                            <p>Venue:</p>
                            <p>{alert.tournament.location}</p>
                        </div>
                    </div>
                    <p>This would be needed for joining the tournament</p>

                    <div className="baseAction">
                        <Button alt full onClick={() => { setAlert(false) }}>Close</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {alert && <PayAlert />}

            {
                matchMutation?.data?.matches.length == 0 ? (
                    <div className="noContent eWrap">
                        <div className="ebound ">
                            <div className="cleft">
                                <h1>Tounament tickets</h1>
                                <p>Nothing here yet, try getting a ticket</p>
                                <Button onClick={actions}>Buy a ticket</Button>
                            </div>
                        </div>
                    </div>
                ) : (

                    <>
                        <div className="eWrap">
                            <div className="ebound eSplit">
                                <div className="cleft">
                                    <p>Tickets Bought,</p>
                                    <h1>{matchMutation?.data?.matches?.length || 0}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="coContent">
                            <div className="header">
                                <h2>Your Tickets</h2>
                            </div>

                            <div className="ticksList">
                                {
                                    matchMutation?.data?.matches.map((item, index) => (
                                        <div className="ticks" key={"tic" + index}>
                                            <div className="tickImg"
                                                style={{
                                                    background: `url(${item.tournament.tournamentImgURL})`,
                                                    backgroundSize: "cover"
                                                }}
                                            ></div>
                                            <p className="tickContent">{item.tournament.name}</p>
                                            <p className="tickContent">NGN {item.tournament.price}</p>
                                            <p className="tickContent">{item.tournament.location}</p>
                                            <p className="tickContent">{dayjs(item.tournament.date).format("MMMM DD, YYYY hh:mm A")}</p>
                                            <Button onClick={() => setAlert(item)}>View Ticket</Button>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </>
                )
            }
        </>
    )
}
