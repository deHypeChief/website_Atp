/* eslint-disable react/prop-types */

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react/dist/iconify.js";
import round from "/round.svg"
import { checkMatch, getTourPayLink, payDues, payTraining, setAutoRenew } from "../../libs/api/api.endpoints";
import Button from "../../components/button/button";

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

export function BillingContent({ setAction }) {
    const [opens, setOpens] = useState(false)
    return (
        <div className="topWrapContent">
            <div className="firste ebound eSplit">

                <div className="toHeader" onClick={() => { setOpens(!opens) }}>
                    <h2>Membership Package</h2>
                    <Icon icon="iconamoon:arrow-down-2-bold" width="24" height="24" style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease-in-out"
                    }} />
                </div>
                <p>If you are currently on a payment plan and you wish to switch to another plan, just click on the new plan you wish to subscribe to.</p>

                {
                    opens && (
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
                                                            key: item.duration,
                                                            type: "Membership Package",
                                                            plan: item.title,
                                                            price: item.priceNGN,
                                                            duration: item.duration
                                                        })
                                                    }}>
                                                        <p style={{ fontSize: ".9rem" }}>{index <= 0 ? "Free " : "Join"}</p>
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

export function BillingContent2({ data, setAction, userSubData }) {
    const [opens, setOpens] = useState(false)


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

                <div className="toHeader" onClick={() => { setOpens(!opens) }}>
                    <h2>Training Package</h2>
                    <Icon icon="iconamoon:arrow-down-2-bold" width="24" height="24" style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease-in-out"
                    }} />
                </div>
                <p>If you are currently on a payment plan and you wish to switch to another plan, just click on the new plan you wish to subscribe to.</p>

                {
                    opens && (
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
                                            <p>
                                                <b>Price: </b> NGN{" "}
                                                {(() => {
                                                    const isOnPlan = userSubData.data?.membership?.plan !== "none";
                                                    const basePrice = data?.packages?.regular?.plans?.[0]?.price || 0;
                                                    const discount = data?.packages?.regular?.discount || 0;

                                                    return isOnPlan
                                                        ? (basePrice * (1 - discount / 100)).toLocaleString()
                                                        : basePrice.toLocaleString();
                                                })()}
                                            </p>
                                            <p><b>Duration: </b>1 Month</p>
                                            {/* <p><b>Duratioppp: </b>{data?.packages?.regular?.plans?.[0]?.price}</p> */}
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
                                            <p>
                                                <b>Price: </b> NGN{" "}
                                                {(() => {
                                                    const isOnPlan = userSubData.data?.membership?.plan !== "none";
                                                    const basePrice = data?.packages?.standard?.plans?.[0]?.price || 0;
                                                    const discount = data?.packages?.standard?.discount || 0;

                                                    return isOnPlan
                                                        ? (basePrice * (1 - discount / 100)).toLocaleString()
                                                        : basePrice.toLocaleString();
                                                })()}
                                            </p>

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

                                            <p>
                                                <b>Price: </b> NGN{" "}
                                                {(() => {
                                                    const isOnPlan = userSubData.data?.membership?.plan !== "none";
                                                    const basePrice = data?.packages?.premium?.plans?.[0]?.price || 0;
                                                    const discount = data?.packages?.premium?.discount || 0;

                                                    return isOnPlan
                                                        ? (basePrice * (1 - discount / 100)).toLocaleString()
                                                        : basePrice.toLocaleString();
                                                })()}
                                            </p>

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
                                            <p>
                                                <b>Price: </b> NGN{" "}
                                                {(() => {
                                                    const isOnPlan = userSubData.data?.membership?.plan !== "none";
                                                    const basePrice = data?.packages?.family?.plans?.[0]?.price || 0;
                                                    const discount = data?.packages?.family?.discount || 0;

                                                    return isOnPlan
                                                        ? (basePrice * (1 - discount / 100)).toLocaleString()
                                                        : basePrice.toLocaleString();
                                                })()}
                                            </p>
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
                                            <p>
                                                <b>Price: </b> NGN{" "}
                                                {(() => {
                                                    const isOnPlan = userSubData.data?.membership?.plan !== "none";
                                                    const basePrice = data?.packages?.couples?.plans?.[0]?.price || 0;
                                                    const discount = data?.packages?.couples?.discount || 0;

                                                    return isOnPlan
                                                        ? (basePrice * (1 - discount / 100)).toLocaleString()
                                                        : basePrice.toLocaleString();
                                                })()}
                                            </p>
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

export function BillingSummary({ action, dataFn, payDataRec, subData }) {
    const [status, setStatus] = useState(false)
    const [loading, setLoading] = useState(false);
    const [expData, setExpDate] = useState("");

    const [payData, setPayData] = useState({
        key: dataFn.key,
        type: dataFn.type || "Membership Package",
        plan: dataFn.plan || "Free Plan",
        price: dataFn.price,
        planType: 0,
        autoRenew: false,
    });

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setPayData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    useEffect(() => {
        const checkfn = async () => {
            const checkData = await checkMatch({
                tournament: dataFn._id,
                user: dataFn.userData._id
            })
            let stat = checkData.match ? true : false
            setStatus(stat)
        }
        checkfn()
    }, [])


    useEffect(() => {
        const today = new Date();
        // console.log(payData)
        if (payData.type === "Membership Package") {
            const planType = payData.key; // 0 for monthly, 1 for quarterly, 2 for yearly

            if (planType === "monthly") {
                today.setMonth(today.getMonth() + 1);
            } else if (planType === "quarterly") {
                today.setMonth(today.getMonth() + 3);
            } else if (planType === "yearly") {
                today.setFullYear(today.getFullYear() + 1);
            }

            const formatted = today.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });

            setExpDate(formatted);
        }

        if (payData.type === "Training Package") {
            const planType = parseInt(payData.planType); // ensure number

            if (planType === 0) {
                today.setMonth(today.getMonth() + 1);
            } else if (planType === 1) {
                today.setMonth(today.getMonth() + 3);
            }

            const formatted = today.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });

            setExpDate(formatted);
        }
    }, [payData.planType]);

    async function handleSubmit() {
        console.log("Submitting payment data", payData);
        setLoading(true)
        try {
            let payLink;
            if (payData.type === "Training Package") {
                payLink = await payTraining(
                    payData.key,
                    Number(payData.planType) === 0 ? "1month" : "3months"
                );
            }
            if (payData.type === "Membership Package") {
                await setAutoRenew(payData.autoRenew)
                payLink = await payDues(payData.key, payData.autoRenew);
            }

            if (payData.key === "Ticket") {
                await getTourPayLink(dataFn._id)
                    .then((link) => {
                        if (link === undefined) {
                            setLoading(false)
                            alert("Network error during payment. Try reloading the page.");
                            return;
                        }
                        window.location.href = link;
                    })
            }

            setLoading(false);
            window.location.href = payLink.paystackResponse.data.authorization_url;
        } catch (err) {
            setLoading(false)

            console.error(err);
            setLoading(false);
        }
    }


    return (
        <div className="layoutOverlay">
            <div className="layoutBase">
                <div className="headerLL">
                    <h2>Payment Summary</h2>
                    <Button alt onClick={() => action(false)}>
                        Close
                    </Button>
                </div>

                <div className="pawyWrap">
                    <div className="paContent">
                        <div className="payfType">
                            <h3>{dataFn.type.toUpperCase()}</h3>

                            <div className="cmo vm">
                                {
                                    payData.key !== "Ticket" && (
                                        <div className="toVVWrap">
                                            <h3>{dataFn.plan}</h3>
                                            <div className="saveBo">
                                                <Icon
                                                    icon="fluent-emoji-flat:party-popper"
                                                    width="20"
                                                    height="20"
                                                />
                                                {payData.type === "Training Package" && subData?.data?.membership?.plan !== "none" && (
                                                    <p className="saveText">Save {payDataRec?.packages?.[payData.key]?.discount}%</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }

                                <p>
                                    {dataFn.message ||
                                        "This plan offers full dashboard access, tournament insights, community support, progress tracking, exclusive training perks, social events, priority tournament benefits, and a premium badge to showcase your status."}
                                </p>
                            </div>
                            <br />

                            <div className="cmo vv">
                                <Icon icon="fluent-color:alert-urgent-20" width="50" height="50" />
                                <p>
                                    Please carefully review the selected payment before you
                                    proceed to make your payment.
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
                                {
                                    payData.key !== "Ticket" && (
                                        <p className="textO">
                                            {dataFn.type === "Membership Package" ? "Renews On" : "Ends On"}
                                        </p>
                                    )
                                }
                                <p>{expData}</p>
                            </div>

                            <br />

                            <div className="orderContent">
                                <p className="textO">Total Amount:</p>
                                <p className="textTotal">
                                    ₦
                                    {(() => {
                                        const isOnPlan =
                                            subData?.data.membership?.plan !== "none";
                                        const basePrice =
                                            dataFn.price[payData.planType]?.price || 0;
                                        const discount =
                                            payDataRec?.packages?.[payData.key]?.discount || 0;

                                        if (dataFn.type === "Training Package") {
                                            const finalPrice = isOnPlan
                                                ? basePrice * (1 - discount / 100)
                                                : basePrice;
                                            return finalPrice.toLocaleString();
                                        }

                                        return dataFn.price;
                                    })()}
                                </p>
                            </div>
                        </div>

                        {
                            payData.key !== "Ticket" && (
                                <div className="orWarp bbOWrap">
                                    {dataFn.type === "Membership Package" && (
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
                                    )}

                                    {dataFn.type === "Training Package" && (
                                        <>
                                            <p>Select a Duration</p>
                                            <select
                                                name="planType"
                                                value={payData.planType}
                                                onChange={handleChange}
                                            >
                                                <option value={0}>1 Month</option>
                                                <option value={1}>3 Months</option>
                                            </select>
                                        </>
                                    )}
                                </div>
                            )
                        }

                        {
                            payData.key !== "Ticket" ? (
                                dataFn.type === "Training Package" ? (
                                    subData?.data?.training?.status === "Paid" ? (
                                        <Button full disabled={true}>
                                            Already on a Training Package
                                        </Button>
                                    ) : (
                                        <Button full disabled={loading} onClick={handleSubmit}>
                                            {loading ? "Processing..." : "Make Payment"}
                                        </Button>
                                    )
                                ) : (
                                    subData?.data?.membership?.status === "Paid" ? (
                                        <Button full disabled={true} >
                                            Already on a Membership Package
                                        </Button>
                                    ) : (
                                        <Button full disabled={loading} onClick={handleSubmit}>
                                            {loading ? "Processing..." : "Make Payment"}
                                        </Button>
                                    )
                                )
                            ) : (
                                status ? (
                                    <Button full disabled={true}>
                                        Already Paid
                                    </Button>
                                ) : (
                                    <Button full disabled={loading} onClick={handleSubmit}>
                                        {loading ? "Processing..." : "Make Payments"}
                                    </Button>
                                )
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
