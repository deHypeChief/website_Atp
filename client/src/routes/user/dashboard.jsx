/* eslint-disable react/prop-types */
import Button from "../../components/button/button";
import { useAuth } from "../../libs/hooks/use-auth";
import "../../libs/styles/dashboard.css";

import raIcon3 from "../../libs/images/Vector.svg";

import { useQuery } from "@tanstack/react-query";
import { checkMatch, getMatches, getNotify, getTour, getTourPayLink, getMe, getPayMe, billingInfo, payTraining } from "../../libs/api/api.endpoints";
import { useEffect, useRef, useState } from "react";
// import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Icon } from "@iconify/react/dist/iconify.js";
import { QRCodeCanvas } from 'qrcode.react';
// import { useMutation } from '@tanstack/react-query'
import Chart from 'chart.js/auto'
import { Link } from "react-router-dom";
import iconBox from "/Icon.svg"
import trend from "/ic-trending-up-24px.png"
import round from "/round.svg"
import ball from "/ball.png"

dayjs.extend(relativeTime);
const plans = [
    {
        title: "Free Plan",
        priceNGN: 0,
        priceUSD: 0,
        duration: "",
        extra: "",
        content: [
            "Access to Dashboard",
            "Access to ATP Tournaments Page",
            "Join Free WhatsApp Community",
            "Join Premium WhatsApp Community",
            "Access to Progress Tracker",
            "Training / Coaching Discounts",
            "1 Free Training / Quarter",
            "Exclusive Social Events",
            "Tournament Priority Access & 5% Discount",
            "Premium Badge on Dashboard",
        ],
    },
    {
        title: "Premium Monthly",
        extra: "",
        priceNGN: 6000,
        priceUSD: 5,
        duration: "monthly",
        content: [
            "Access to Dashboard",
            "Access to ATP Tournaments Page",
            "Join Free WhatsApp Community",
            "Join Premium WhatsApp Community",
            "Access to Progress Tracker",
            "Training / Coaching Discounts",
            "1 Free Training / Quarter",
            "Exclusive Social Events",
            "Tournament Priority Access & 5% Discount",
            "Premium Badge on Dashboard",
        ],
    },
    {
        title: "Premium Quarterly",
        extra: "Save N25 if when you join",
        priceNGN: 17000,
        priceUSD: 10,
        duration: "quarterly",
        content: [
            "Access to Dashboard",
            "Access to ATP Tournaments Page",
            "Join Free WhatsApp Community",
            "Join Premium WhatsApp Community",
            "Access to Progress Tracker",
            "Training / Coaching Discounts",
            "1 Free Training / Quarter",
            "Exclusive Social Events",
            "Tournament Priority Access & 5% Discount",
            "Premium Badge on Dashboard",
        ],
    },
    {
        title: "Premium Yearly",
        extra: "Save N25 if when you join",
        priceNGN: 70000,
        priceUSD: 50,
        duration: "yearly",
        content: [
            "Access to Dashboard",
            "Access to ATP Tournaments Page",
            "Join Free WhatsApp Community",
            "Join Premium WhatsApp Community",
            "Access to Progress Tracker",
            "Training / Coaching Discounts",
            "1 Free Training / Quarter",
            "Exclusive Social Events",
            "Tournament Priority Access & 5% Discount",
            "Premium Badge on Dashboard",
        ],
    },
]

export default function Dashboard() {
    const { user, userLogout } = useAuth();
    const [slide, setSlide] = useState(0)
    const [userData, setUserData] = useState()

    const [openPayment, setOpenPayment] = useState(false)

    useEffect(() => {
        setUserData(user())
    }, [])


    useEffect(() => {
        console.log(openPayment)
    }, [openPayment])


    const userMutation = useQuery({
        queryKey: ["user"],
        queryFn: () => getMe()
    })
    const matchMutation = useQuery({
        queryKey: ["match"],
        queryFn: () => getMatches()
    })
    const tourMunation = useQuery({
        queryKey: ["tour"],
        queryFn: () => getTour()
    })


    {/* 
        DATA MODEL

        {
            planType: 
            PlanName
            message;
        }
    */}


    return (
        <div className="dashboardSection">

            <div className="sideContent" id="hamSide">

                <div className="sdeTopContent">
                    <div className={`sideContent_Bttn ${slide != 0 && "sc_BttnClosed"}`} onClick={() => { setSlide(0) }}>
                        <p>Your Overview</p>
                    </div>
                    <div className={`sideContent_Bttn ${slide != 2 && "sc_BttnClosed"}`} onClick={() => { setSlide(2) }}>
                        <p>Your Coach</p>
                    </div>
                    <div className={`sideContent_Bttn ${slide != 1 && "sc_BttnClosed"}`} onClick={() => { setSlide(1) }}>
                        <p>Tickets</p>
                    </div>

                    <div className={`sideContent_Bttn ${slide != 3 && "sc_BttnClosed"}`} onClick={() => { setSlide(3) }}>
                        <p>Tournaments</p>
                    </div>
                    <div className={`sideContent_Bttn ${slide != 4 && "sc_BttnClosed"}`} onClick={() => { setSlide(4) }}>
                        <p>Notifications</p>
                    </div>
                    <div className={`sideContent_Bttn ${slide != 5 && "sc_BttnClosed"}`} onClick={() => { setSlide(5) }}>
                        <p>Billings</p>
                    </div>
                </div>

                <div className="sideBottomContent">
                    <Link to={"/login"} onClick={() => {
                        userLogout()
                        document.getElementsByTagName("nav")[0].style.display = "block"
                        document.getElementsByTagName("footer")[0].style.display = "block"
                    }}>
                        <div className="sideContent_Bttn sc_BttnClosed">
                            <p>Logout</p>
                        </div>
                    </Link>
                </div>


            </div>

            <div className="dashboardContent" id="dContent">
                {openPayment && <BillingSummary action={setOpenPayment} dataFn={openPayment} />}
                {/* display section */}
                {slide == 0 && <YourOverview user={userData} matchMutation={matchMutation} />}
                {slide == 1 && <Tickets matchMutation={matchMutation} actions={() => { setSlide(3) }} />}
                {slide == 2 && <YourCoach setAction={setSlide} user={userMutation.data} actions={() => { setSlide(5) }} />}
                {slide == 3 && <Tournaments tour={tourMunation} matchMutation={matchMutation} user={userMutation?.data} />}
                {slide == 4 && <Notifications />}
                {slide == 5 && <Billings setDataFn={setOpenPayment} />}
            </div>
        </div>
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
function Tickets({ matchMutation, actions }) {
    const [alert, setAlert] = useState(false)

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


// coach content
const ReviewForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        rating: "",
        comment: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="layoutOverlay">
            <div className="layoutBase">
                <div className="coachText">
                    <h3>Post a Review</h3>
                    <p>Post your review on your assigned coach</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            required
                            name="rating"
                            onChange={handleChange}
                            value={formData.rating}
                            type="number"
                            className="textInput"
                            placeholder="Rate the coach (0-5)"
                            min="0"
                            max="5"
                        />
                        <textarea
                            required
                            name="comment"
                            onChange={handleChange}
                            value={formData.comment}
                            className="textAreaReview"
                            placeholder="Write your comment here"
                        ></textarea>
                        <div className="reviewBttn">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Back
                            </Button>
                            <Button type="submit">
                                Drop a review
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
const ReviewCard = ({ name, rating, comment }) => (
    <div className="coCBox">
        <div className="topCoHeader">
            <div className="imgSecH"></div>
            <div className="userContInfo">
                <h3>{name}</h3>
                <p>{rating} stars</p>
            </div>
        </div>
        <p className="textList">{comment}</p>
    </div>
);
const YourCoach = ({ user, actions }) => {
    // const [isCoachAssigned, setIsCoachAssigned] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviews, setReviews] = useState([
        { id: 1, name: "David Moves", rating: "2", comment: "hello big matr" },
        { id: 2, name: "David Moves", rating: "2", comment: "hello big matr" },
        { id: 3, name: "David Moves", rating: "2", comment: "hello big matr" },
        { id: 4, name: "David Moves", rating: "2", comment: "hello big matr" }
    ]);

    const handleSubmitReview = (newReview) => {
        const review = {
            id: reviews.length + 1,
            name: "Current User", // You might want to get this dynamically
            ...newReview
        };
        setReviews(prev => [...prev, review]);
        console.log("Posting Comment:", newReview);
    };

    // No coach assigned view
    let a = 2
    if (a === 1) {
        return (
            <div className="noContent eWrap">
                <div className="ebound">
                    <div className="cleft">
                        <div className="boude">
                            <img src={ball} alt="" />
                        </div>
                        <h1>Getting your Coach</h1>
                        <p>Expect an email notification soon with details about your coach's.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user.assignedCoach) {
        return (
            <div className="noContent eWrap">
                <div className="ebound">
                    <div className="cleft">
                        <h1>No Coach Yet</h1>
                        <p>Join a training plan and a coach would be assigned to you</p>

                        <Button onClick={actions}>See Plans</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {isReviewModalOpen && (
                <ReviewForm
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={handleSubmitReview}
                />
            )}

            <div className="eWrap">
                <div className="ebound eSplit cce">
                    <div className="cleft">
                        <div className="clefCont">
                            <div className="imgWrap">
                                <div className="imgCircel">
                                    <Icon icon="solar:user-bold" width="44" height="44" />
                                    {/* <img src={} alt="" /> */}
                                </div>
                            </div>
                            <p>Your Coach,</p>
                            <h1>David Okoye A.</h1>
                            <Button onClick={() => setIsReviewModalOpen(true)}>
                                Add a Review
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="coContent">
                <div className="header">
                    <h2>Reviews</h2>
                </div>
                <div className="coContentBoxs">
                    {reviews.map(review => (
                        <ReviewCard
                            key={review.id}
                            name={review.name}
                            rating={review.rating}
                            comment={review.comment}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
// coach end


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
function Tournaments({ tour, matchMutation, user }) {
    const [alert, setAlert] = useState(false)

    return (
        <>
            {alert && <TourPayAlert setAlert={setAlert} alert={alert} />}
            <div className="tourDiv">
                <div className="eWrap">
                    <div className="ebound ">
                        <div className="cleft">
                            <p>Next Tour,</p>
                            <h1>{tour.data[tour.data.length - 1]?.name || "No tours yet"}</h1>
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
function Notifications() {
    const notifyMutation = useQuery({
        queryKey: ["notify"],
        queryFn: () => getNotify()
    })
    return (
        <>
            {
                notifyMutation.data?.length <= 0 ? (
                    <div className="noContent">
                        <div className="ebound ">
                            <div className="cleft">
                                <h1>No Notifications Yet</h1>
                                <p>We will keep you updated</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="coContent">
                        <div className="header">
                            <h1>Notifications</h1>
                        </div>

                        <div className="notiBoxi">
                            {
                                notifyMutation.data?.map((item, index) => (
                                    <div className="notiB" key={item.title}>
                                        <div key={"noytif" + index} className="titNotiB">
                                            <h2>{item.title}</h2>
                                            <p>{dayjs(item.createdAt).format("MMMM D, YYYY h:mm A")}</p>
                                        </div>
                                        <p>{item.message}</p>
                                    </div>
                                )
                                )
                            }
                        </div>
                    </div>
                )
            }
        </>
    )
}


function Billings({ setDataFn }) {
    const [otPay, setOTPay] = useState(false)
    const [memData, setMemData] = useState(false)
    const [trainingData, setTrainingData] = useState(false)

    const { data } = useQuery({
        queryKey: ["billingData"],
        queryFn: () => getPayMe()
    })
    const payInfo = useQuery({
        queryKey: ["payInfo"],
        queryFn: () => billingInfo()
    })


    return (
        <>
            {/* {otPay && <OneTimeFee action={() => { setOTPay(false) }} price={payInfo.data.registration.price || 0.00} />} */}

            <div className="coContent">
                <div className="header">
                    <h1>Billings</h1>
                    <p>Manage and renew your billings easily</p>
                </div>


                <div className="topWrapContent">
                    <div className="topWrapContent">
                        <div className="firste ebound eSplit">
                            <div className="topVV">
                                <div className="planWrap">
                                    <p>Current Membership Package</p>
                                    <h1>{data?.data?.bills?.membershipBill?.plan || "Free Plan"}</h1>
                                    <p style={{
                                        fontSize: ".8rem",
                                        paddingTop: "10px",
                                    }}>*Current Plan ends on 20/07/2028</p>

                                </div>
                                <div className="actionB">
                                    <Button>Renew Plan</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <BillingContent setAction={setDataFn} />
                    <BillingContent2 data={payInfo.data} setAction={setDataFn} />
                    <div className="topWrapContent">
                        <div className="firste ebound eSplit">
                            <div className="topVV" style={{
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <div className="planWrap">
                                    <h2>Your Billing History</h2>

                                    <p style={{
                                        fontSize: ".8rem",
                                        // paddingTop: "10px",
                                    }}>List of all payments made on ATP</p>

                                </div>
                                <div className="actionB">
                                    <Button>View History</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
function BillingContent({ setAction }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="topWrapContent">
            <div className="firste ebound eSplit">

                <div className="toHeader" onClick={() => { setOpen(!open) }}>
                    <h2>Membership Package</h2>
                    <Icon icon="iconamoon:arrow-down-2-bold" width="24" height="24" style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease-in-out"
                    }} />
                </div>
                <p>If you are currently on a payment plan and you wish to switch to another plan, just click on the new plan you wish to subscribe to.</p>

                {
                    open && (
                        <div className="billBox">
                            <div className="prices">
                                {
                                    plans.map((item, index) => {
                                        return (
                                            <div className="boxP" key={item.title}>
                                                {
                                                    item.extra != "" && (
                                                        <div className="tag"
                                                            style={{
                                                                background:
                                                                    index === 2 ?
                                                                        "#0A3DBF" :
                                                                        index === 3 ?
                                                                            "#6F2CCD" : ""
                                                            }}
                                                        >
                                                            <p>{item.extra}</p>
                                                        </div>
                                                    )
                                                }
                                                <div className="planBox"
                                                    style={{
                                                        background: index === 1 ?
                                                            "linear-gradient(-180deg, #0AC271 0%, #0A91C2 100%)" :
                                                            index === 2 ?
                                                                "linear-gradient(-180deg, #0A93BF 41.83%, #0A3DBF 100%)" :
                                                                index === 3 ?
                                                                    "linear-gradient(-180deg, #0A45BF 0%, #6F2CCD 100%)" : ""
                                                    }}
                                                >
                                                    <div className="headerPlan">
                                                        <h2>{item.title}</h2>
                                                    </div>
                                                    <div className="contentList">
                                                        {
                                                            item.content.map((item, i) => {
                                                                return (
                                                                    <div key={item} className="priceListBox">
                                                                        <div className="pDot">
                                                                            <img src={round} alt="" />
                                                                        </div>

                                                                        {
                                                                            i > 2 ? (
                                                                                <p className="pContent" style={{
                                                                                    textDecoration: index === 0 ? "line-through" : "",
                                                                                    opacity: index === 0 ? ".6" : "",
                                                                                }}>
                                                                                    {item}
                                                                                </p>
                                                                            ) : (
                                                                                <p className="pContent">
                                                                                    {item}
                                                                                </p>
                                                                            )
                                                                        }

                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                                <div className="groupActionBase">
                                                    <div className="priceBoxNum"
                                                        style={{
                                                            background: index === 1 ?
                                                                "#0A91C2" :
                                                                index === 2 ?
                                                                    "#0A3DBF" :
                                                                    index === 3 ?
                                                                        "#6F2CCD" : ""
                                                        }}
                                                    >
                                                        <div className="notch"
                                                            style={{
                                                                boxShadow: index === 1 ?
                                                                    `-12px -12px 0px 10px #0A91C2` :
                                                                    index === 2 ?
                                                                        "-12px -12px 0px 10px #0A3DBF" :
                                                                        index === 3 ?
                                                                            "-12px -12px 0px 10px #6F2CCD" : ""
                                                            }}
                                                        ></div>

                                                        <h2>₦{item.priceNGN}/${item.priceUSD}</h2>
                                                        <p>per month</p>
                                                    </div>

                                                    <div className="priceButton" onClick={() => {
                                                        setAction({
                                                            type: "Membership Package",
                                                            plan: item.title,
                                                            price: item.priceNGN,
                                                            duration: item.duration
                                                        })
                                                    }}>
                                                        <p>{index <= 0 ? "Join for Free " : "Subscribe"}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
function BillingContent2({ data, setAction }) {
    const [open, setOpen] = useState(false)


    async function handlePayment(planKey) {
        const selectedPlan = data.packages?.[planKey];
        const payload = {
            key: planKey,
            type: "Training Package",
            plan: selectedPlan?.name,
            price: selectedPlan?.plans,
            duration: "1 Month",
            message: selectedPlan?.info,
        };

        console.log({ data, planKey, selectedPlan, payload });
        setAction(payload);
    }

    return (
        <div className="topWrapContent">
            <div className="firste ebound eSplit">

                <div className="toHeader" onClick={() => { setOpen(!open) }}>
                    <h2>Training Package</h2>
                    <Icon icon="iconamoon:arrow-down-2-bold" width="24" height="24" style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease-in-out"
                    }} />
                </div>
                <p>If you are currently on a payment plan and you wish to switch to another plan, just click on the new plan you wish to subscribe to.</p>

                {
                    open && (
                        <>
                            <div className="plansWrap">
                                <div className="planList">
                                    <div className="planBox">
                                        <div className="pBoxContent">
                                            <div className="planImage" style={{
                                                background: `url(https://i.pinimg.com/736x/bf/35/8b/bf358bc32786ac95d8783c8f3c07bbc5.jpg)`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                width: "100%"
                                            }}>

                                            </div>
                                            <h2>{data.packages?.regular?.name || "--"}</h2>
                                            <p><b>Price: </b> NGN {data.packages?.regular.plans[0].price || "--"}</p>
                                            <p><b>Duration: </b>1 Month</p>
                                            <p className="plText">{data.packages?.regular.info || "--"}</p>
                                        </div>
                                        <p className="fni" style={{
                                            margin: "20px 0",
                                            fontSize: ".8rem"
                                        }}>
                                            *All on a membership plan would recive a discount during checkout*
                                        </p>
                                        <Button full onClick={() => { handlePayment("regular") }}>Make Payment</Button>

                                    </div>
                                    <div className="planBox">
                                        <div className="pBoxContent">
                                            <div className="planImage" style={{
                                                background: `url(https://i.pinimg.com/736x/bf/35/8b/bf358bc32786ac95d8783c8f3c07bbc5.jpg)`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                width: "100%"
                                            }}>

                                            </div>
                                            <h2>{data.packages?.standard.name}</h2>
                                            <p><b>Price: </b> NGN {data.packages?.standard.plans[0].price}</p>
                                            <p><b>Duration: </b>1 Month</p>
                                            <p className="plText">{data.packages?.standard.info}</p>
                                        </div>
                                        <p className="fni" style={{
                                            margin: "20px 0",
                                            fontSize: ".8rem"
                                        }}>
                                            *All on a membership plan would recive a discount during checkout*
                                        </p>
                                        <Button full onClick={() => { handlePayment("standard") }}>Make Payment</Button>
                                    </div>
                                    <div className="planBox">
                                        <div className="pBoxContent">
                                            <div className="planImage" style={{
                                                background: `url(https://i.pinimg.com/736x/bf/35/8b/bf358bc32786ac95d8783c8f3c07bbc5.jpg)`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                width: "100%"
                                            }}>

                                            </div>
                                            <h2>{data.packages?.premium.name}</h2>
                                            <p><b>Price: </b> NGN {data.packages?.premium.plans[0].price}</p>
                                            <p><b>Duration: </b>1 Month</p>
                                            <p className="plText">{data.packages?.premium.info}</p>
                                        </div>
                                        <p className="fni" style={{
                                            margin: "20px 0",
                                            fontSize: ".8rem"
                                        }}>
                                            *All on a membership plan would recive a discount during checkout*
                                        </p>
                                        <Button full onClick={() => { handlePayment("premium") }}>Make Payment</Button>

                                    </div>
                                </div>
                            </div>
                            <div className="plansWrap">
                                <h2>Special Training Plans</h2>
                                <div className="planList">
                                    <div className="planBox">
                                        <div className="pBoxContent">
                                            <div className="planImage" style={{
                                                background: `url(https://i.pinimg.com/736x/fd/c3/eb/fdc3eb1f8fa99c664e32e0bf27238816.jpg)`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                width: "100%"
                                            }}>

                                            </div>
                                            <h2>{data.packages?.family.name}</h2>
                                            <p><b>Price: </b> NGN {data.packages?.family.plans[0].price}</p>
                                            <p><b>Duration: </b>1 Month</p>
                                            <p className="plText">{data.packages?.family.info}</p>
                                        </div>
                                        <p className="fni" style={{
                                            margin: "20px 0",
                                            fontSize: ".8rem"
                                        }}>
                                            *All on a membership plan would recive a discount during checkout*
                                        </p>
                                        <Button full onClick={() => {
                                            handlePayment("family")
                                        }}>Make Payment</Button>

                                    </div>
                                    <div className="planBox">
                                        <div className="pBoxContent">
                                            <div className="planImage" style={{
                                                background: `url(https://i.pinimg.com/736x/4c/f8/1d/4cf81db6a2def537f469df3ec69350e4.jpg)`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                width: "100%"
                                            }}>

                                            </div>
                                            <h2>{data.packages?.couples.name}</h2>
                                            <p><b>Price: </b> NGN {data.packages?.couples.plans[0].price}</p>
                                            <p><b>Duration: </b>1 Month</p>
                                            <p className="plText">{data.packages?.couples.info}</p>
                                        </div>

                                        <p className="fni" style={{
                                            margin: "20px 0",
                                            fontSize: ".8rem"
                                        }}>
                                            *All on a membership plan would recive a discount during checkout*
                                        </p>
                                        <Button full onClick={() => {
                                            handlePayment("couples")
                                        }}>Make Payment</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    )
}


function BillingSummary({ action, dataFn }) {

    console.log(dataFn)
    const [loading, setLoading] = useState(false)

    const [payData, setPayData] = useState({
        key: dataFn.key,
        type: dataFn.type || "Membership Package",
        plan: dataFn.plan || "Free Plan",
        price: dataFn.price,
        planType: 0,
        autoRenew: false,
    })

    function handleChange(e) {
        console.log(e.target.value)
        setPayData({
            ...payData,
            [e.target.name]: e.target.value
        })
    }

    async function handleSubmit() {
        console.log("Submitting payment data", payData);

        if (payData.type === "Training Package") {
            await payTraining(payData.key, Number(payData.planType) == 0 ? "1month" : "3months")
                .then((payLink) => {
                    setLoading(false)
                    window.location.href = payLink.paystackResponse.data.authorization_url
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }


    return (
        <div className="layoutOverlay">
            <div className="layoutBase">
                <div className="headerLL">
                    <h2>Payment Summary</h2>
                    <Button alt onClick={() => { action(false) }}>
                        Close
                    </Button>
                </div>

                <div className="pawyWrap">
                    <div className="paContent">
                        <div className="payfType">
                            <h3>{dataFn.type}</h3>


                            <div className="cmo vm">
                                <div className="toVVWrap">
                                    <h3>
                                        {dataFn.plan}
                                    </h3>
                                    <div className="saveBo">
                                        <Icon icon="fluent-emoji-flat:party-popper" width="20" height="20" />

                                        <p className="saveText">
                                            Save 20%
                                        </p>
                                    </div>
                                </div>
                                <p>
                                    {dataFn.message || "This plan offers full dashboard access, tournament insights, community support, progress tracking, exclusive training perks, social events, priority tournament benefits, and a premium badge to showcase your status."}
                                </p>
                            </div>
                            <br />


                            <div className="cmo vv">
                                <Icon icon="fluent-color:alert-urgent-20" width="50" height="50" />
                                <p>
                                    Please carefully review this plan you want to pay for before you proceed to make your payment.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="Order">
                        <div className="orWarp">
                            <div className="orderHeader">
                                <h3>Order Summary</h3>
                            </div>
                            <div className="orderContent">
                                <p className="textO">Renews On</p>
                                <p >Jan 15 2024</p>
                            </div>
                            <br />
                            <div className="orderContent">
                                <p className="textO">Total Amount:</p>
                                <p className="textTotal">₦{
                                    dataFn.type === "Training Package" ? (dataFn.price[payData.planType].price) : dataFn.price
                                }.00</p>
                            </div>
                        </div>

                        <div className="orWarp bbOWrap">

                            {
                                dataFn.type === "Membership Package" && (
                                    <div className="auto">
                                        <p>Auto renewal</p>
                                        <input
                                            type="checkbox"
                                            id="autoRenew"
                                            name="autoRenew"
                                            checked={payData.autoRenew}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )
                            }
                            {
                                dataFn.type === "Training Package" && (
                                    <>
                                        <p>Select a Duration</p>
                                        <select name="planType" value={payData.planType} id="" onChange={handleChange}>
                                            <option value="0">1 Month</option>
                                            <option value="1">3 Months</option>
                                        </select>
                                    </>
                                )
                            }
                        </div>

                        <Button full disabled={loading} onClick={handleSubmit}>Make Payment</Button>
                    </div>
                </div>

                {/* <div className="topWrapContent">
                    <div className="firste ebound eSplit">
                        <div className="toHeader">
                            <h2>Payment Summary</h2>
                        </div>
                        <p>Here you can view your billing summary and history.</p>
                    </div>
                </div> */}
            </div>
        </div>
    )
}