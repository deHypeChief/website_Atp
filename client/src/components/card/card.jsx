/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import Button from "../button/button"
import "./style.css"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../libs/hooks/use-auth"

import raIcon1 from "../../libs/images/Group 1.svg"
import raIcon2 from "../../libs/images/Vector-1.svg"
import raIcon3 from "../../libs/images/Vector.svg"
import raIcon4 from "../../libs/images/Group.svg"

export default function Card({ altCard, payload, teamCard, onClick }) {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    function handleReg() {
        if (isAuthenticated()) {
            console.log("pricing page")
        } else {
            navigate("/login")
            console.log("son of a bug")
        }
    }

    return (
        <div className="cardBox" onClick={onClick}>
            <div className="cardImg"
            >
                <img style={{ height: "100%", width: '100%', objectFit: 'cover' }} src={payload?.tournamentImgURL || payload?.imageUrl} alt="" />
            </div>
            <div className="cardInfo">
                {
                    teamCard ? (
                        <>hi</>
                    ) : (
                        altCard ? (
                            <>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
                                            <circle cx={12} cy={6} r={4} fill="#113858"></circle>
                                            <path fill="#113858" d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5"></path>
                                        </svg>
                                    </div>
                                    <p>{payload?.name}</p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
	<path fill="#113858" d="M12 2c2.5 0 4.75.9 6.5 2.4A9.98 9.98 0 0 0 15 12c0 3.04 1.36 5.77 3.5 7.6c-1.75 1.5-4 2.4-6.5 2.4s-4.75-.9-6.5-2.4A9.98 9.98 0 0 0 9 12c0-3.04-1.36-5.77-3.5-7.6C7.25 2.9 9.5 2 12 2m10 10c0 2.32-.79 4.45-2.12 6.15A8 8 0 0 1 17 12c0-2.47 1.12-4.68 2.88-6.15A9.94 9.94 0 0 1 22 12M2 12c0-2.32.79-4.45 2.12-6.15A8 8 0 0 1 7 12c0 2.47-1.12 4.68-2.88 6.15A9.94 9.94 0 0 1 2 12"></path>
</svg>
                                    </div>
                                    <p>{payload?.type}</p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 24 24">
                                            <path fill="#113858" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"></path>
                                        </svg>
                                    </div>
                                    <p>{payload?.rating}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                        <img src={raIcon1} alt="" />
                                    </div>
                                    <p>{payload?.name} </p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                        <img src={raIcon4} alt="" />

                                    </div>
                                    <p>{payload?.date.split("T")[0]}</p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                        <img src={raIcon3} alt="" />

                                    </div>
                                    <p>{payload?.location}</p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon">
                                        <img src={raIcon2} alt="" />

                                    </div>
                                    <p>{payload?.time}</p>
                                </div>
                            </>
                        )
                    )
                }

                {
                    teamCard ? (
                        <Link to={`/coaching/${payload?.id}`}>
                            <Button full>View Coach Profile</Button>
                        </Link>
                    ) : (
                        altCard ? (
                            <div className="altCard">
                                <Link to={`/coaching/${payload?.id}`}>
                                    <Button alt full blue>View Coach Profile</Button>
                                </Link>
                                {/* {
                                    membership ? (
                                        <Button onClick={action} full>Pick Coach</Button>
                                    ) : null
                                } */}
                            </div>
                        ) : (
                            <Link to={"/login"}>
                                <Button alt full blue onClick={handleReg}>Register Now</Button>
                            </Link>
                        )
                    )
                }

            </div >
        </div >
    )
}