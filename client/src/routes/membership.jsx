import { useEffect, useRef, useState } from "react";
import Button from "../components/button/button";
import Hero from "../components/hero/hero";
import '../libs/styles/membership.css'
import Card from "../components/card/card";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query"
import { getCoaches, getPlans } from "../libs/api/api.endpoints";


// eslint-disable-next-line react/prop-types
export function MembershipAction({ planData = [] }) {
    const navigate = useNavigate()
    const pickCoach = useRef();
    const plansBox = useRef();
    const pickDur = useRef();

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
        const params = new URLSearchParams(planId).toString();

        console.log(params, planId);
        navigate(`/signup?${params}`);
    }
    function handleSelection(e, planId, index) {
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
        setPlanId(prev => ({
            ...prev,
            planId
        }));
        console.log(planId, [...plansBox.current.children])
    }
    function handleCoachSelection(e, coachId) {
        const selectedBox = e.currentTarget;

        // Remove the class from all children
        [...pickCoach.current.children].forEach(item => {
            item.classList.remove("coach-selected");
        });

        // Add class to the selected element
        selectedBox.classList.add("coach-selected");

        // Update the selected coach ID
        setTimeout(() => setPage("duration"), 1000)
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
                                                onClick={(e) => handleSelection(e, item._id, index)}
                                            >
                                                <div className="mem-image">
                                                    <img src={item.planImage} alt="" />
                                                </div>

                                                <div className="mem-box-info">
                                                    <div className="mem-header">
                                                        <h3>{item.planName || "Kiddies Plan"}</h3>
                                                        <div className="mem-price">
                                                            <h2>NGN {item.planPrice || "252,000"}</h2>
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

                            {coachQuery?.data?.map((item, index) => (

                                <div key={"ch"+index} className="cardBox" onClick={(e) => handleCoachSelection(e, item._id)}>
                                    <div className="cardImg">
                                        <img src={item.imageUrl} alt="" />
                                    </div>
                                    <div className="cardInfo">
                                        <>
                                            <div className="boxWrap">
                                                <p>{item.coachName}</p>
                                            </div>
                                        </>
                                    </div>
                                </div>

                            ))}
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
                                    return (
                                        <div
                                            key={"in" + index}
                                            className={`durBox ${index === 0 ? "durBox-selected" : ""}`}
                                            onClick={(e) => handleDurationSelection(e,index)}>
                                            <div className="durInfo">
                                                <h1>NGN {item.billingPrice}</h1>
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
    const membershipPlans = [
        {
            _id: 0,
            planName: "Kiddies Plan",
            price: "N252,000",
            priceInfo: "for three (3) months (VAT inclusive)",
            description: "This plan is for children from ages 4 to 12 years.",
            note: "Children in this age category are to be escorted and supervised by a parent/guardian on the court."
        },
        {
            _id: 1,
            planName: "Kiddies Plan",
            price: "N252,000",
            priceInfo: "for three (3) months (VAT inclusive)",
            description: "This plan is for children from ages 4 to 12 years.",
            note: "Children in this age category are to be escorted and supervised by a parent/guardian on the court."
        }
    ];
    return (
        <>
            <Hero title={"Adult Plan"} noAction subTitle={""} />
            <MembershipAction planData={membershipPlans} />
        </>
    )
}

export function ComboMembership() {
    const membershipPlans = [
        {
            _id: 0,
            planName: "Kiddies Plan",
            price: "N252,000",
            priceInfo: "for three (3) months (VAT inclusive)",
            description: "This plan is for children from ages 4 to 12 years.",
            note: "Children in this age category are to be escorted and supervised by a parent/guardian on the court."
        },
        {
            _id: 1,
            planName: "Kiddies Plan",
            price: "N252,000",
            priceInfo: "for three (3) months (VAT inclusive)",
            description: "This plan is for children from ages 4 to 12 years.",
            note: "Children in this age category are to be escorted and supervised by a parent/guardian on the court."
        }
    ];

    return (
        <>
            <Hero title={"Special Combo"} noAction subTitle={""} />
            <MembershipAction planData={membershipPlans} />
        </>
    )
}