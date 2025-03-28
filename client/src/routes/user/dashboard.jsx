/* eslint-disable react/prop-types */
import Button from "../../components/button/button";
import { useAuth } from "../../libs/hooks/use-auth";
import "../../libs/styles/dashboard.css";

import raIcon1 from "../../libs/images/Group 1.svg";
import raIcon2 from "../../libs/images/Vector-1.svg";
import raIcon3 from "../../libs/images/Vector.svg";
import raIcon4 from "../../libs/images/Group.svg";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkMatch, getMatches, getNotify, getTour, getTourPayLink, getMembershPayLink, getMe, postComment } from "../../libs/api/api.endpoints";
import { useEffect, useRef, useState } from "react";
// import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import currency from 'currency.js'
import { Icon } from "@iconify/react/dist/iconify.js";
import { QRCodeCanvas } from 'qrcode.react';
// import { useMutation } from '@tanstack/react-query'
import Chart from 'chart.js/auto'
import { Link, useNavigate } from "react-router-dom";


dayjs.extend(relativeTime);

export default function Dashboard() {
    const { user, userLogout } = useAuth();
    const [slide, setSlide] = useState(0)
    const [userData, setUserData] = useState()

    // const isCalled = useRef(false);
    // const [billingLoading, setBillingLoading] = useState(false)

    // // const [payQuery, setPayQuery] = useState("")


    // useEffect(() => {
    //     async function fetchPayLink(query) {
    //         if (isCalled.current) return; // Check if already called
    //         isCalled.current = true; // Set flag to prevent re-runs

    //         try {
    //             const flwLink = await getMembershPayLink(query);
    //             setBillingLoading(true)
    //             console.log(flwLink); // Logs the resolved payment link

    //             if (flwLink === undefined) {
    //                 setBillingLoading(false)
    //                 alert("Network error during payment. Try reloading the page.");
    //                 return;
    //             }
    //             window.location.href = flwLink;
    //         } catch (error) {
    //             console.error("Error fetching payment link:", error);
    //         }
    //     }

    //     const queryParams = new URLSearchParams(window.location.search);
    //     const planId = queryParams.get('planId');

    //     if (planId) {
    //         fetchPayLink(window.location.search);
    //     }
    // }, []);

    // useEffect(() => {
    //     console.log(user())
    // }, [])

    useEffect(() => {
        setUserData(user())
    }, [])

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


    return (
        <div className="dashboardSection">

            <div className="sideContent">

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

            <div className="dashboardContent">
                {/* <OneTimeFee /> */}
                {/* display section */}
                {slide == 0 && <YourOverview user={userData} matchMutation={matchMutation} />}
                {slide == 1 && <Tickets matchMutation={matchMutation} />}
                {slide == 2 && <YourCoach setAction={setSlide} user={userMutation.data}/>}
                {slide == 3 && <Tournaments tour={tourMunation} matchMutation={matchMutation} user={userMutation?.data}/>}
                {slide == 4 && <Notifications />}
                {slide == 5 && <Billings />}
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


    return (
        <div className="eWrap">
            <div className="ebound eSplit">
                <div className="cleft">
                    <p>Good Afternoon,</p>
                    <h1>{user?.fullName || "No name found"}</h1>
                </div>
                <div className="cWins">
                    {/* <p>0 wins so far</p> */}
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

function Tickets({ matchMutation }) {
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
                        <Button alt onClick={() => { setAlert(false) }}>Close</Button>
                        <Button>Get Ticket</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {alert && <PayAlert />}

            {
                matchMutation?.data?.matches.length < 0  ? (
                    <div className="noContent">
                        <div className="ebound ">
                            <div className="cleft">
                                <h1>Tounament tickets</h1>
                                <p>Nothing here yet, try getting a ticket</p>
                                <Button>Buy a ticket</Button>
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

const YourCoach = ({ setAction, user }) => {
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
    if (!user.assignedCoach) {
        return (
            <div className="noContent">
                <div className="ebound">
                    <div className="cleft">
                        <h1>No Coach Yet</h1>
                        <p>Join a training plan and a coach would be assigned to you</p>
                        <Button>See Plans</Button>
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
                <div className="ebound eSplit">
                    <div className="cleft">
                        <p>Your Coach,</p>
                        <h1>David Okoye A.</h1>
                    </div>
                    <div className="cWins">
                        <Button onClick={() => setIsReviewModalOpen(true)}>
                            Add a Review
                        </Button>
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


function TourPayAlert({ alert, setAlert, userID }) {
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
            ): (
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
            {alert && <TourPayAlert setAlert={setAlert} alert={alert}/>}
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
                    tour.data?.length < 0 ? (
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
                                                    setAlert({...item, userData: user})
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
                notifyMutation.data?.length < 0 ? (
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
                                    <div className="notiB">
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

function Billings() {
    const [data, setData] = useState(true)
    return (
        <>
            {
                data != true ? (
                    <div className="noContent">
                        <div className="ebound ">
                            <div className="cleft">
                                <h1>No Transactions Yet</h1>
                                <p>Join a plan or tranning program and keep track here</p>
                                <Button>Get a ticket</Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="coContent">
                        <div className="header">
                            <h1>Billings</h1>
                        </div>

                        <div className="billBox">
                            <div className="billOne">
                                <div className="billImage"></div>
                                <div className="billcontent">
                                    <h1>Reg One time Payment</h1>
                                    <p>Due Date: None</p>
                                </div>
                                <div className="billStatusPill">
                                    <p>Completed</p>
                                </div>
                            </div>

                            <div className="billOne">
                                <div className="billImage"></div>
                                <div className="billcontent">
                                    <h1>Membership Dues Payment</h1>
                                    <p>Due Date: 26th June 2025</p>
                                    <Button>Cancel Payment</Button>
                                </div>
                                <div className="billStatusPill">
                                    <p>OnGoing</p>
                                </div>
                            </div>

                            <div className="billOne">
                                <div className="billImage"></div>
                                <div className="billcontent">
                                    <h1>Regular Traning Package</h1>
                                    <p>Due Date: 23rd June 2025</p>
                                    <Button>Renew Payment</Button>
                                </div>
                                <div className="billStatusPill">
                                    <p>Paid</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

function OneTimeFee() {
    return (
        <div className="layoutOverlay">
            <div className="layoutBase">
                <div className="oneSection">
                    <div className="onImage">

                    </div>
                    <h3>
                        Welcome to ATP.
                    </h3>
                    <p>New members are to pay a one time fee to join the club</p>
                </div>
                <div className="baseAction">
                    <Button full>Pay NGN 20000</Button>
                </div>
            </div>
        </div>
    )
}
