/* eslint-disable react/prop-types */
import Button from "../../components/button/button";
import { useAuth } from "../../libs/hooks/use-auth";
import "../../libs/styles/dashboard.css";

import raIcon3 from "../../libs/images/Vector.svg";

import { useQuery } from "@tanstack/react-query";
import { getMatches, getMe, getPayMe, getTour, getUserMatchesC } from "../../libs/api/api.endpoints";
import { useEffect, useRef, useState } from "react";
// import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Icon } from "@iconify/react/dist/iconify.js";
// import { useMutation } from '@tanstack/react-query'
import Chart from 'chart.js/auto'
import iconBox from "/Icon.svg"
import trend from "/ic-trending-up-24px.png"
import { BillingSummary } from "./billingSuport";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);


export default function Dashboard() {
    const { user } = useAuth();
    const [userData, setUserData] = useState()

    const [openPayment, setOpenPayment] = useState(false)

    useEffect(() => {
        setUserData(user())
    }, [])


    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const payParam = queryParams.get('pay');

        if (payParam) {
            setOpenPayment(JSON.parse(payParam));
        }
    }, []);


    const matchMutation = useQuery({
        queryKey: ["match"],
        queryFn: () => getMatches()
    })


    return (
        <>
            {openPayment && <BillingSummary action={setOpenPayment} dataFn={openPayment} />}
            {/* display section */}
            <YourOverview user={userData} matchMutation={matchMutation} />
        </>
    );
}


function YourOverview({ matchMutation, user }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    const { data } = useQuery({
        queryFn: () => {
            async function moreFn() {
                const payload = {
                    user: await getMe(),
                    billing: await getPayMe(),
                    tour: await getTour(),
                    cMatch: await getUserMatchesC()
                }
                console.log(payload);
                return payload
            }
            return moreFn()
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        queryKey: ["moreDataDash"]
    })


    useEffect(() => {
        sliderRef.current.style.gridTemplateColumns = `repeat(${data?.length}, 100%)`
        scrollToSlide(currentSlide);
    }, [currentSlide, data?.length]);

    const handleNext = () => {
        if (currentSlide < data.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const scrollToSlide = (index) => {
        const slide = sliderRef.current.children[index];
        slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    };

    useEffect(() => {
        const chart = new Chart(
            document.getElementById('doChart'), {
            type: 'doughnut',
            options: {
                responsive: true,
            },
            data: {
                datasets: [{
                    label: 'Matches',
                    data: [data?.cMatch?.totalWins, data?.cMatch?.totalMatches],
                    backgroundColor: [
                        '#92CD0C',
                        '#113858',
                    ],
                    hoverOffset: 4
                }]
            },
        }
        );
        return () => chart.destroy();
    }, [data?.cMatch?.totalMatches, data?.cMatch?.totalWins])
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Morning";
        if (hour < 17) return "Afternoon";
        return "Evening";
    };

    return (
        <div className="eWrap">
            <h2 className="nametopp">
                {getGreeting()}, {user?.fullName.split(" ")[0] || "No name found"}
            </h2>
            <div className="topWrapSec">
                <div className="firste ebound eSplit ">
                    <div className="bcontent">
                        <div className="bcont">
                            <p className="bName">Your Ranking</p>
                            <h2>{data?.cMatch?.rank || "--"}</h2>
                        </div>
                        <div className="bextra">
                            <img src={iconBox} alt="" className="imgcontent" />
                        </div>
                    </div>
                    <div className="boundBase">
                        {/* <div className="baseImg">
                            <img src={trend} alt="" className="iconBase" />
                        </div> */}
                        <p>{data?.cMatch?.improvement || "--"}</p>
                    </div>
                </div>



                {
                    data?.billing.data.membership.plan === "none" ? (
                        <>
                            <div className="firste ebound eSplit ">
                                <div className="bcontent">
                                    <div className="bcont">
                                        <p className="bName">Your Membership</p>
                                        <h2>Free</h2>
                                    </div>
                                </div>
                                <div className="boundBase">
                                    <p>Upgrade to get training discount</p>
                                </div>
                            </div>

                            <div className="firste ebound eSplit ">
                                <div className="bcontent">
                                    <div className="bcont">
                                        <p className="bName">Join the Free ATP Community</p>
                                        <p>Click the link below to join the free WhatsApp group</p>
                                    </div>
                                </div>
                                <div className="boundBase">
                                    <Link to="https://chat.whatsapp.com/Fb6QzLLZ4gsK6nhoTzXBIc" style={{ width: "100%" }}>
                                        <Button full>
                                            <Icon icon="mingcute:whatsapp-line" width="24" height="24" />
                                            <p>Join Whatsapp</p>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="firste ebound eSplit ">
                                <div className="bcontent">
                                    <div className="bcont">
                                        <p className="bName">Your Membership</p>
                                        <h2>{data?.billing.data.membership.plan} Plan</h2>
                                    </div>
                                </div>
                                <div className="boundBase">
                                    <p>Get 15% discount on your next training plan</p>
                                </div>
                            </div>
                            <div className="firste ebound eSplit ">

                                <div className="bcontent">
                                    <div className="bcont">
                                        <p className="bName">Join the Premium ATP Community</p>
                                        <p className="bp">Click the link below to join the premium WhatsApp group</p>
                                    </div>
                                </div>
                                <div className="boundBase">
                                    <Link to="https://chat.whatsapp.com/I6gwsNWfYKELAO4pHg21ue" style={{ width: "100%" }}>
                                        <Button full>
                                            <Icon icon="mingcute:whatsapp-line" width="24" height="24" />
                                            <p>Join Whatsapp</p>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>

            <div className="overviewGroup">
                <div className="ebound track" style={{
                    opacity: data?.cMatch?.totalMatches > 0 && data?.billing.data.membership.plan !== "none" ? 1 : 0.5, pointerEvents: data?.cMatch?.totalMatches > 0 && data?.billing.data.membership.plan !== "none" ? "auto" : "none"
                }}>
                    <h2>Progress Tracker</h2>
                    <div className="trackBox">
                        {data?.cMatch?.totalMatches > 0 && data?.billing.data.membership.plan !== "none" ? (
                            <canvas id="doChart" className="doChart"></canvas>
                        ) : (
                            <div className="no-data">
                                <svg xmlns="http://www.w3.org/2000/svg" width={44} height={44} viewBox="0 0 24 24">
                                    <g fill="currentColor">
                                        <path d="M9.883 2.207a1.9 1.9 0 0 1 2.087 1.522l.025.167L12 4v7a1 1 0 0 0 .883.993L13 12h6.8a2 2 0 0 1 2 2a1 1 0 0 1-.026.226A10 10 0 1 1 9.504 2.293l.27-.067z"></path>
                                        <path d="M14 3.5V9a1 1 0 0 0 1 1h5.5a1 1 0 0 0 .943-1.332a10 10 0 0 0-6.11-6.111A1 1 0 0 0 14 3.5"></path>
                                    </g>
                                </svg>
                                <p style={{ marginTop: "12px" }}>{data?.billing.data.membership.plan !== "none" ? "No match data yet" : "Upgrade to a premium plan to access this feature"}</p>
                            </div>
                        )}
                    </div>
                    <div className="sopts">
                        <div className="spbox">
                            <div className="spM"></div>
                            <p>Matches Played</p>
                        </div>
                        <div className="spbox">
                            <div className="spM spMa"></div>
                            <p>Matches Won</p>
                        </div>
                    </div>
                </div>

                <div className="ebound cals">
                    <h2>Upcoming Tournament</h2>
                    <div className="calBox">
                        <button onClick={handlePrev} disabled={currentSlide === 0} className="buttons upL">
                            <Icon icon="iconamoon:arrow-left-2-duotone" width="20px" height="20px" />
                        </button>
                        <button onClick={handleNext} disabled={currentSlide === (data?.tour?.length || 0) - 1} className="buttons upR">
                            <Icon icon="iconamoon:arrow-right-2-duotone" width="20px" height="20px" />
                        </button>

                        <div className="cardBoxup" ref={sliderRef}>
                            {(data?.tour?.length ?? 0) > 0 ? (
                                data.tour.map((item, index) => (
                                    <div key={"m" + index} className="upCard">
                                        <div className="bigTextUp">
                                            <h1 className="ipText">{item.date.split("T")[0].split("-")[2]}</h1>
                                        </div>
                                        <h2 className="tourTitleUp">{item.name}</h2>
                                        <div className="baseupinfo">
                                            <div className="datPill">
                                                <img src={raIcon3} alt="" height={20}/>
                                                <p>{item.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data upCard" style={{ marginTop: "55px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width={44} height={44} viewBox="0 0 24 24">
                                        <path fill="currentColor" d="m9.7 17.758l-.708-.708l2.3-2.3l-2.3-2.3l.708-.708l2.3 2.3l2.3-2.3l.708.708l-2.3 2.3l2.3 2.3l-.708.708l-2.3-2.3zM5.616 21q-.691 0-1.153-.462T4 19.385V6.615q0-.69.463-1.152T5.616 5h1.769V2.77h1.077V5h7.154V2.77h1V5h1.769q.69 0 1.153.463T20 6.616v12.769q0 .69-.462 1.153T18.384 21zm0-1h12.769q.23 0 .423-.192t.192-.424v-8.768H5v8.769q0 .23.192.423t.423.192"></path>
                                    </svg>
                                    <p>No upcoming tournaments yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


