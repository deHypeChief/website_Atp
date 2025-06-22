/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { billingInfo, getPayMe } from "../../libs/api/api.endpoints";
import { useState } from "react";
import Button from "../../components/button/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import round from "/round.svg"


export function Billings() {
    const { data } = useQuery({
        queryKey: ["billingData"],
        queryFn: () => getPayMe(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
    const payInfo = useQuery({
        queryKey: ["payInfo"],
        queryFn: () => billingInfo(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
    const [openPayment, setOpenPayment] = useState(false)



    return (
        <>
            {openPayment && <BillingSummary action={setOpenPayment} dataFn={openPayment} />}

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
                    <BillingContent setAction={setOpenPayment} />
                    <BillingContent2 data={payInfo.data} setAction={setOpenPayment} />
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

export function BillingSummary({ action, dataFn }) {

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

        // if (payData.type === "Training Package") {
        //     await payTraining(payData.key, Number(payData.planType) == 0 ? "1month" : "3months")
        //         .then((payLink) => {
        //             setLoading(false)
        //             window.location.href = payLink.paystackResponse.data.authorization_url
        //         })
        //         .catch((err) => {
        //             console.log(err)
        //         })
        // } else {
        //     await payDues(payData.key)
        //         .then((payLink) => {
        //             setLoading(false)
        //             window.location.href = payLink.paystackResponse.data.authorization_url
        //         })
        //         .catch((err) => {
        //             console.log(err)
        //         })
        // }
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
            </div>
        </div>
    )
}