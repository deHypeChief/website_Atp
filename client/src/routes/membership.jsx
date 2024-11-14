import { useEffect, useRef, useState } from "react";
import Button from "../components/button/button";
import Hero from "../components/hero/hero";
import '../libs/styles/membership.css'
import Card from "../components/card/card";
import { useLocation, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query"
import { getCoaches, getPlans } from "../libs/api/api.endpoints";


// eslint-disable-next-line react/prop-types
export function MembershipAction({ planData = [] }) {
    const navigate = useNavigate()
    const location = useLocation();
    const pickCoach = useRef();
    const plansBox = useRef();
    const pickDur = useRef();
    const [memType, setMemType] = useState()
    const [selectedPlan, setSelectedPlan] = useState()
    const [selectedCoach, setSelectedCoach] = useState()

    const [page, setPage] = useState("plan")
    const [planId, setPlanId] = useState({
        planId: planData[0]?._id || null,
        billingType: 0,
        coachId: ""
    });
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)

    const coachQuery = useQuery({
        queryFn: async () => {
            return getCoaches();
        },
        queryKey: ["coachesMem"]
    });


    function handleSubmit() {
        const queryParams = new URLSearchParams(location.search);
        const params = new URLSearchParams(planId).toString();

        const userSigned = queryParams.get('userSigned');
        console.log(userSigned)
        if (userSigned == "true") {
            navigate(`/u?${params}`);
            return
        }

        console.log(params, planId);
        navigate(`/signup?${params}`);
    }

    useEffect(() => {
        if (window.location.href.includes("combo")) {
            setMemType("combo");
            return;
        }
        if (window.location.href.includes("adult")) {
            setMemType("adult");
            return;
        }
    }, []);



    function handleSelection(e, planId, index, item) {
        e.preventDefault()
        const selectedBox = e.currentTarget;

        // Remove the class from all children
        [...plansBox.current.children].forEach(item => {
            item.classList.remove("mem-selected");
        });


        // Add class to the selected element
        selectedBox.classList.add("mem-selected");

        // Update the selected plan ID
        setTimeout(() => setPage("coach"), 1000)

        setSelectedPlanIndex(index)
        setSelectedPlan(item)
        setPlanId(prev => ({
            ...prev,
            planId
        }));
        console.log(planId, [...plansBox.current.children])
    }
    function handleCoachSelection(e, coachId, item) {
        const selectedBox = e.currentTarget;

        // Remove the class from all children
        [...pickCoach.current.children].forEach(item => {
            item.classList.remove("coach-selected");
        });

        // Add class to the selected element
        selectedBox.classList.add("coach-selected");

        // Update the selected coach ID
        setTimeout(() => setPage("duration"), 1000)
        setSelectedCoach(item)
        setPlanId(prev => ({
            ...prev,
            coachId
        }));
    }
    function handleDurationSelection(e, billingType) {
        const selectedBox = e.currentTarget;

        // Remove the class from all children
        [...pickDur.current.children].forEach(item => {
            item.classList.remove("durBox-selected");
        });

        // Add class to the selected element
        selectedBox.classList.add("durBox-selected");

        // Update the selected coach ID
        setPlanId(prev => ({
            ...prev,
            billingType
        }));
    }

    return (
        <section className="memContentSection">
            {
                page == "plan" && (
                    <>
                        <div className="pickHeader">
                            <h1>Choose a plan that works best for you</h1>
                        </div>
                        <div className="mem-plans" ref={plansBox}>
                            {
                                planData.length > 0 ? (
                                    planData.map((item, index) => {
                                        return (
                                            <div
                                                key={"memBox" + index}
                                                className={`mem-box`}
                                                onClick={(e) => handleSelection(e, item._id, index, item)}
                                            >
                                                <div className="mem-image">
                                                    <img src={item.planImage} alt="" />
                                                </div>

                                                <div className="mem-box-info">
                                                    <div className="mem-header">
                                                        <h3>{item.planName || "Kiddies Plan"}</h3>
                                                        <div className="mem-price">
                                                            <h2>{item.planPrice > 0 && "NGN"} {item.planPrice || "The price would be in coach section"}</h2>
                                                            <p className="mem-info-price">
                                                                {item.priceInfo}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p>
                                                        <span className="bold">Description:</span> {item.description}
                                                    </p>
                                                    <p>
                                                        <span className="bold">Additional Information:</span> There’ll be a 10% discount if the client pays for 6 months at once and a 20% discount if they pay for 12 months.
                                                    </p>
                                                    <p className="info-text">
                                                        {item.note ? `Note: ${item.note}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>No plans available.</p>
                                )
                            }
                        </div>
                    </>
                )
            }
            {
                page == "coach" && (
                    <>
                        <div className="pickHeader">
                            <h1>Pick a coach that works for you</h1>
                        </div>
                        <div className="coachList" ref={pickCoach}>

                            {
                                coachQuery?.data?.map((item, index) => {
                                    if (selectedPlan.filterPrams.includes(item.level)) {
                                        return (
                                            <div key={"ch" + index} className="cardBox" onClick={(e) => handleCoachSelection(e, item._id, item)}>
                                                <div className="cardImg">
                                                    <img src={item.imageUrl} alt="" />
                                                </div>
                                                <div className="cardInfo">
                                                    <>
                                                        <div className="boxWrap">
                                                            <p>{item.coachName}</p>
                                                        </div>

                                                        {
                                                            memType === "combo" ? (
                                                                <div className="boxWrap">
                                                                    <p>NGN {item.price}</p>
                                                                </div>
                                                            ) : ""
                                                        }
                                                    </>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                            }

                        </div>
                        <div className="memButtonWrapAction">
                            <Button onClick={() => setPage("plan")} alt blue>Back</Button>
                        </div>
                    </>
                )
            }
            {
                page == "duration" && (
                    <>
                        <div className="pickHeader">
                            <h1>Selete a duration you can work with</h1>
                        </div>

                        <div className="durationWrap" ref={pickDur}>
                            {
                                planData[selectedPlanIndex].billingPlans.map((item, index) => {
                                    const discountFactor = 1 - (item.discountPercentage / 100);
                                    const payAmount = selectedCoach.price * item.interval * discountFactor;
                                    return (
                                        <div
                                            key={"in" + index}
                                            className={`durBox ${index === 0 ? "durBox-selected" : ""}`}
                                            onClick={(e) => handleDurationSelection(e, index)}>
                                            <div className="durInfo">
                                                <h1>NGN {payAmount}</h1>
                                                <h2>for {item.interval} months</h2>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>


                        <div className="memButtonWrapAction">
                            <Button onClick={() => setPage("coach")} alt blue>Back</Button>
                            <Button onClick={handleSubmit}>Get Started</Button>
                        </div>
                    </>
                )
            }
        </section>
    )
}

export function ChildrenMembership() {

    const planData = useQuery({
        queryFn: () => getPlans("children"),
        queryKey: ["childrenPlan"]
    })

    return (
        <>
            <Hero title={"Children's Plan"} noAction subTitle={""} />
            <MembershipAction planData={planData?.data} />
        </>
    );
}

export function AdultMembership() {
    const planData = useQuery({
        queryFn: () => getPlans("adult"),
        queryKey: ["adultPlan"]
    })
    return (
        <>
            <Hero title={"Adult Plan"} noAction subTitle={""} />
            <MembershipAction planData={planData?.data} />
        </>
    )
}

export function ComboMembership() {
    const planData = useQuery({
        queryFn: () => getPlans("special"),
        queryKey: ["specialPlan"]
    })

    return (
        <>
            <Hero title={"Special Combo"} noAction subTitle={""} />
            <MembershipAction planData={planData?.data} />
        </>
    )
}