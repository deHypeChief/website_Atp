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
import { useNavigate } from "react-router-dom";


dayjs.extend(relativeTime);

export default function Dashboard() {
    const { user } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [userData, setUserData] = useState()
    const sliderRef = useRef(null);
    const isCalled = useRef(false);

    // const [payQuery, setPayQuery] = useState("")


    useEffect(() => {
        async function fetchPayLink(query) {
            if (isCalled.current) return; // Check if already called
            isCalled.current = true; // Set flag to prevent re-runs

            try {
                const flwLink = await getMembershPayLink(query);
                console.log(flwLink); // Logs the resolved payment link

                if (flwLink === undefined) {
                    alert("Network error during payment. Try reloading the page.");
                    return;
                }
                window.location.href = flwLink;
            } catch (error) {
                console.error("Error fetching payment link:", error);
            }
        }

        const queryParams = new URLSearchParams(window.location.search);
        const planId = queryParams.get('planId');

        if (planId) {
            fetchPayLink(window.location.search);
        }
    }, []);


    // Fetch the tournaments data using React Query
    const { data } = useQuery({
        queryKey: ["tourData"],
        queryFn: () => getTour(),
    });

    const matchMutation = useQuery({
        queryKey: ["match"],
        queryFn: () => getMatches()
    })

    const userMutation = useQuery({
        queryKey: ["user"],
        queryFn: () => getMe()
    })

    const notifyMutation = useQuery({
        queryKey: ["notify"],
        queryFn: () => getNotify()
    })

    useEffect(() => {
        // console.log(notifyMutation.data)
        const chart = new Chart(
            document.getElementById('doChart'), {
            type: 'doughnut',
            options: {
                responsive: true,
            },
            data: {
                datasets: [{
                    label: 'Match Data',
                    data: [matchMutation?.data?.matchesWon || 0, matchMutation?.data?.matches?.length || 0],
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
        sliderRef.current.style.gridTemplateColumns = `repeat(${data?.length}, 100%)`
        scrollToSlide(currentSlide);
    }, [currentSlide, data?.length]);

    const [type, setType] = useState({
        type: null,
        payload: {}
    });



    function setTourPayload(payload) {
        console.log("booming", payload);  // Check if payload has valid data here
        setType({
            type: "paymentTour",
            data: payload,
            user: userMutation.data  // Ensure user() is returning a valid user object
        });
    }

    function OpenCoachReview() {
        setType({
            type: "OpenCoachReview",
            data: {
                coach: userMutation.data?.assignedCoach
            }
        });
    }

    return (
        <section className="borderWrap">
            {
                type.type !== null ?
                    <ActionOverflow payload={type} typeAction={setType} /> :
                    null
            }

            <div className="profile">
                <div className="topAct">
                    <div className="actL">
                        <h2>Profile Overview</h2>
                        <div className="actProf">
                            <h1>{userMutation.data?.fullName.split(" ")[0].split("")[0]}</h1>
                        </div>
                        <h2 className="spec">Hello, {userMutation.data?.fullName}.</h2>
                    </div>
                    <div className="actR">
                        {
                            userMutation.data?.assignedCoach ? <Button onClick={OpenCoachReview}>View Coach</Button> : null
                        }
                    </div>
                </div>

                <div className="infoList">
                    <div className="infoMo">
                        <p className="nHead">Name</p>
                        <p>{userMutation.data?.fullName}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Matches Played</p>
                        <p>{matchMutation?.data?.matches?.length || "--"}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Membership</p>
                        <p>{userMutation.data?.membership === "" ? "Free" : userMutation.data?.membership}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Phone</p>
                        <p>{userMutation.data?.phoneNumber}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Matches Won</p>
                        <p>{matchMutation?.data?.matchesWon || "--"}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Current Skill Level</p>
                        <p>{userMutation.data?.level}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Email</p>
                        <p>{userMutation.data?.email}</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Medals Won</p>
                        <p>0</p>
                    </div>
                    <div className="infoMo">
                        <p className="nHead">Assigned Coach</p>
                        <p>{userMutation.data?.assignedCoach?.coachName || "--"}</p>
                    </div>
                </div>
            </div>

            <div className="track">
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

            <div className="cals">
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
                <div className="torns">
                    {/* Conditionally render tournaments */}
                    {data?.length > 0 ? (
                        data.map((item, index) => (
                            <div className="bonBox" key={"tour" + index}>
                                <div className="bonVor">
                                    <div className="bonboxN">
                                        <img src={raIcon1} alt="" />
                                    </div>
                                    <p>{item.name}</p>
                                </div>
                                <div className="bonVor">
                                    <div className="bonboxN">
                                        <img src={raIcon4} alt="" />
                                    </div>
                                    <p>{item.date.split("T")[0]}</p>
                                </div>
                                <div className="bonVor">
                                    <div className="bonboxN">
                                        <img src={raIcon3} alt="" />
                                    </div>
                                    <p>{item.location}</p>
                                </div>
                                <div className="bonVor">
                                    <div className="bonboxN">
                                        <img src={raIcon2} alt="" />
                                    </div>
                                    <p>{item.time}</p>
                                </div>

                                <div className="comAction">
                                    <Button full alt blue onClick={() => setTourPayload(item)}>
                                        Register Now
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No tournaments available</p>
                    )}
                </div>
                {/* <div className="calsAction">
                    <Button>See all tournaments</Button>
                </div> */}
            </div>

            <div className="notify">
                <div className="topNo">
                    <h2>Notifications</h2>
                    {/* <p>See All</p> */}
                </div>
                <div className="notiList">
                    {/* Notification example */}
                    {
                        notifyMutation.data ? (
                            notifyMutation.data.map((item, index) => {
                                return (
                                    <div className="notiBox" key={"notify" + index}>
                                        <p>
                                            {item.message}.
                                        </p>
                                        <div className="comP">
                                            <p className="notiBo">{dayjs(item.createdAt).format('D MMMM, YYYY')}.</p>
                                            <p className="notiBo">{dayjs(item.createdAt).fromNow()}</p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : "No notification found"
                    }
                </div>
            </div>
        </section>
    );
}

export function ActionOverflow({ typeAction, payload }) {

    function resetType() {
        typeAction({
            type: null,
            payload: {}
        });
    }

    return (
        <div className="overlayPage">
            <div className="overWrap">
                <div className="absClose">
                    <div className="closeIcon" onClick={resetType}>
                        <Icon icon="si:close-duotone" width="40px" height="40px" />
                    </div>
                </div>
                {
                    payload.type === "paymentTour"
                        ? <SelectedTourPayPage payload={payload} action={typeAction} />
                        : payload.type === "ticket"
                            ? <Ticket payload={payload} />
                            : payload.type === "OpenCoachReview"
                                ? <ViewCoach payload={payload} />
                                : null
                }
            </div>
        </div>
    );
}



export function SelectedTourPayPage({ payload, action }) {
    const { user, data } = payload;
    const [isPaymentPending, setIsPaymentPending] = useState(false);
    const [payLink, setPaylink] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const checkMatchInfo = async () => {
            try {
                const response = await checkMatch({ tournament: data._id, user: user._id });
                if (response.match) {
                    action({ type: "ticket", payload: response });
                } else {
                    setIsPaymentPending(true);
                }
            } catch (error) {
                console.error("Error checking match info:", error);
            }
        };
        checkMatchInfo();
    }, [data._id, user._id, action]);

    function handlePayLink() {
        const fetchPayLink = async () => {
            setPaylink(false)
            try {
                const flwLink = await getTourPayLink(data._id); // Await the async function
                console.log(flwLink); // Logs the resolved payment link

                if (flwLink === undefined) {
                    setPaylink(true)
                    alert("Network error during payment")
                    return
                }
                window.location.href = flwLink

            } catch (error) {
                console.error("Error fetching payment link:", error);
            }
        };
        fetchPayLink(); // Call the async function
    }

    const formattedPrice = currency(Number(data?.price), { symbol: "₦", precision: 2 }).format();
    const formattedDate = dayjs(data.date).format("D MMMM, YYYY");

    return (
        <div className="tourCenter">
            <div className="tourImage">
                <img src={data.tournamentImgURL} alt={`${data.name} tournament`} />
            </div>
            <div className="tourText">
                <p>You are about to register for {data.name}</p>
                <p className="regInfo">What you need to know:</p>
                <p className="regPoints">Price: {formattedPrice}</p>
                <p className="regPoints">Date: {formattedDate}</p>
            </div>
            <div className="tourAction">
                {isPaymentPending && (
                    <Button disabled={!payLink} full onClick={handlePayLink}>
                        {payLink ? "Make Payment" : "Getting payment link.."}
                    </Button>
                )}
            </div>
        </div>
    );
}


function Ticket({ payload }) {
    const { token, user, tournament } = payload.payload.payload.match
    useEffect(() => {
        console.log(payload.payload.payload.match)
    }, [])
    return (
        <div className="tourCenter">
            <div className="tourImage Bn">
                <div className="qrCode">
                    <QRCodeCanvas value={{
                        token: token,
                        name: user.fullName,
                        email: user.email,
                        tourName: tournament.name,
                        tourId: tournament._id
                    }} size={200} level={"H"} />
                </div>
                {/* Add tournament image here */}
            </div>
            <div className="tourText">

                <h2 className="cetText">{token}</h2>

                <p>
                    You have succesfully registered for the <span className="tourtextMain">{tournament.name}</span>
                </p>

                <p className="regInfo">
                    What you need to know:
                </p>
                <p className="regPoints">Name: {user.fullName}</p>
                <p className="regPoints">Date: {dayjs(tournament.date).format('D MMMM, YYYY')}</p>
                <p className="regPoints">Venue: {tournament.location} </p>
            </div>
            <div className="tourAction">
                <Button full>
                    Download Ticket
                </Button>
            </div>
        </div>
    )
}

function ViewCoach({ payload }) {
    const [formData, setFormData] = useState({});
    const queryClient = useQueryClient();
    const [comment, setComment] = useState({
        type: null,
        data: {}
    });

    function openComment() {
        setComment({
            type: "connectSec",
            data: {}
        });
    }

    function closeComment() {
        setComment({
            type: null,
            data: {}
        });
    }


    const commentForm = useMutation({
        mutationFn: (data) => postComment(data),
        mutationKey: ["comment"],
        onSuccess: () => {
            // Invalidate the query for comments to refetch updated data
            queryClient.invalidateQueries("user");
        }
    });

    function handleForm(e) {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }


    function handleSubmit(e) {
        e.preventDefault();
        console.log("Posting Comment:", formData);
        closeComment()
        commentForm.mutate(formData);
    }

    return (
        <div className="coachBox">
            <div className="caochImg">
                <img src={payload.data?.coach.imageUrl} alt="" />

            </div>
            <div className="coachInfo">
                {comment.type === null ? (
                    <>
                        <div className="coachText">
                            <h3>{payload.data?.coach.coachName}</h3>
                            <p>Rating: {payload.data?.coach.avgRate}</p>

                            <Button onClick={openComment}>Drop a review</Button>
                        </div>
                        <div className="commentList">
                            <h2>Reviews: </h2>
                            <div className="commentBoxWrap">
                                {payload.data?.coach.comment.length > 0 ? (
                                    payload.data.coach.comment.map((item, index) => (
                                        <div key={"cm" + index} className="commentBox">
                                            <div className="profileBox">
                                                <div className="imgBoxP">
                                                    <h2>{item.userID.fullName.split(" ")[0].split("")[0].toUpperCase()}</h2>
                                                </div>
                                            </div>

                                            <div className="contText">
                                                <div className="starSec">
                                                    <p>{item.userID.fullName}</p>
                                                    <div className="sec">
                                                        <p>{item.rating}</p>
                                                        <div className="starBox">
                                                        <Icon icon="noto:star" width="18px" height="18px" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p>{item.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No reviews yet.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="coachText">
                            <h3>Post a Review</h3>
                            <p>Post your review on your assigned coach</p>
                            <form onSubmit={handleSubmit}>
                                <input
                                    required
                                    name="rating"
                                    onChange={handleForm}
                                    type="number"
                                    className="textInput"
                                    placeholder="Rate the coach (0-5)"
                                    min="0"
                                    max="5"
                                />
                                <textarea
                                    required
                                    name="comment"
                                    onChange={handleForm}
                                    className="textAreaReview"
                                    placeholder="Write your comment here"
                                ></textarea>
                                <div className="reviewBttn">
                                    <Button
                                        alt
                                        blue
                                        onClick={() =>
                                            setComment({
                                                type: null,
                                                data: {}
                                            })
                                        }
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={commentForm.isPending}>
                                        {commentForm.isPending ? "Adding Comment.." : "Drop a review"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
