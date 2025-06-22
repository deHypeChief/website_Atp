/* eslint-disable react/prop-types */
import Button from "../../components/button/button";
import { useAuth } from "../../libs/hooks/use-auth";
import "../../libs/styles/dashboard.css";

import raIcon3 from "../../libs/images/Vector.svg";

import { useQuery } from "@tanstack/react-query";
import { getMatches, getTour } from "../../libs/api/api.endpoints";
import { useEffect, useRef, useState } from "react";
// import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Icon } from "@iconify/react/dist/iconify.js";
// import { useMutation } from '@tanstack/react-query'
import Chart from 'chart.js/auto'
import iconBox from "/Icon.svg"
import trend from "/ic-trending-up-24px.png"
import { BillingSummary } from "./billingPage";

dayjs.extend(relativeTime);


export default function Dashboard() {
    const { user } = useAuth();
    const [userData, setUserData] = useState()

    const [openPayment, setOpenPayment] = useState(false)

    useEffect(() => {
        setUserData(user())
    }, [])


    useEffect(() => {
        console.log(openPayment)
    }, [openPayment])

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
        queryKey: ["tourData"],
        queryFn: () => getTour(),
    });

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
                    data: [matchMutation?.data?.matchesWon, matchMutation?.data?.matches?.length],
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
    }, [matchMutation?.data?.matches?.length, matchMutation?.data?.matchesWon])
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="eWrap">
            <h2 className="nametopp">
                {getGreeting()}, {user?.fullName || "No name found"}
            </h2>
            <div className="topWrapSec">
                <div className="firste ebound eSplit ">
                    <div className="bcontent">
                        <div className="bcont">
                            <p className="bName">Your Ranking</p>
                            <h2>3rd</h2>
                        </div>
                        <div className="bextra">
                            <img src={iconBox} alt="" className="imgcontent" />
                        </div>
                    </div>
                    <div className="boundBase">
                        <div className="baseImg">
                            <img src={trend} alt="" className="iconBase" />
                        </div>
                        <p>You progressed from 7th position</p>
                    </div>
                </div>

                <div className="firste ebound eSplit ">
                    <div className="bcontent">
                        <div className="bcont">
                            <p className="bName">View Training Plans</p>
                            <h2>You have 15% discount</h2>
                        </div>
                    </div>
                    <div className="boundBase">
                        <p>You are currently on the couples plan</p>
                    </div>
                </div>

                <div className="firste ebound eSplit ">
                    <div className="bcontent">
                        <div className="bcont">
                            <p className="bName">Join the Premium ATP Community</p>
                            <p>Click the link below to join the premium WhatsApp group</p>
                        </div>
                    </div>
                    <div className="boundBase">
                        <Button full>
                            <Icon icon="mingcute:whatsapp-line" width="24" height="24" />
                            <p>Join Whatsapp</p>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overviewGroup">
                <div className="ebound track">
                    <h2>Progress Tracker</h2>
                    <div className="trackBox">

                        <canvas id="doChart" className="doChart">

                        </canvas>
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
                        <button onClick={handleNext} disabled={currentSlide === data?.length - 1} className="buttons upR">
                            <Icon icon="iconamoon:arrow-right-2-duotone" width="20px" height="20px" />
                        </button>

                        <div className="cardBoxup" ref={sliderRef}>

                            {
                                data?.map((item, index) => (
                                    <div key={"m" + index} className="upCard">
                                        <div className="bigTextUp">
                                            <h1 className="ipText">
                                                {item.date.split("T")[0].split("-")[2]}
                                            </h1>
                                        </div>
                                        <h2 className="tourTitleUp">
                                            {item.name}
                                        </h2>
                                        <div className="baseupinfo">
                                            <div className="datPill">
                                                {/* <p>Oct 2024</p> */}
                                            </div>
                                            <div className="datPill">
                                                <img src={raIcon3} alt="" />
                                                <p>{item.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
