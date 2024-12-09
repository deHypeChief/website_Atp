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
                <img style={{height: "100%", width: '100%', objectFit: 'cover'}} src={payload?.tournamentImgURL || payload?.imageUrl} alt="" />
            </div>
            <div className="cardInfo">
                {
                    teamCard ? (
                        <>hi</>
                    ) : (
                        altCard ? (
                            <>
                                <div className="boxWrap">
                                    <div className="boxIcon"></div>
                                    <p>{payload?.name}</p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon"></div>
                                    <p>{payload?.type}</p>
                                </div>
                                <div className="boxWrap">
                                    <div className="boxIcon"></div>
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
                            <Button alt full blue>View Coach Profile</Button>
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