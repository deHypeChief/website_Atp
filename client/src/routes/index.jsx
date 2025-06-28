import Button from "../components/button/button"
import Card from "../components/card/card"
// import line2 from "../libs/images/Line.png"
import line from "../libs/images/Line2.png"
import "../libs/styles/home.css"
import heroImg from "../libs/images/imgUpdate/IMG-20241208-WA0071.jpg"
import Hero from "../components/hero/hero"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getTour } from "../libs/api/api.endpoints"
import { client } from "../sanityClient"
import { useEffect, useState } from "react"
import Reviews from "../components/reviews/review"
import round from "/round.svg"

export default function Home() {
    const [content, setContent] = useState([])

    const toruOuery = useQuery({
        queryFn: getTour,
        queryKey: ["indexTour"]
    })

    useEffect(() => {
        async function getContent() {
            client
                .fetch(`
                    *[_type == "atpContent"]
                `)
                .then((data) => {
                    setContent(data)
                })
                .catch(console.error)
        }
        getContent()
    }, [])

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

    return (
        <>
            <Hero title={content?.homePageTitle || "Join a Community of Passionate Players"} subTitle={"Elevate Your Game"} text={"Find your perfect match, learn from experts, and compete in thrilling tournaments."} imageUrl={heroImg} />

            <section className="about">
                <div className="aboutWrap">
                    <div className="aboutInfoSec">
                        <div className="heroSubTop">
                            <div className="rArrow rL">
                                <img src={line} alt="" />
                            </div>
                            <h2>ABOUT AMATEUR TENNIS PRO</h2>
                            <div className="rArrow rR">
                                <img src={line} alt="" />
                            </div>
                        </div>
                        <h1>
                            Welcome to Amateur Tennis Pro (ATP)
                        </h1>
                        <p>
                            Where passion for tennis meets professional training. Founded with the vision of making tennis accessible and enjoyable for everyone, ATP is dedicated to helping players of all skill levels fall in love with the game, refine their skills, and even reach their dreams of going pro.
                        </p>
                        <div className="aboutAction">
                            <Link to="/about">
                                <Button>Learn More</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="aboutImg">

                    </div>
                </div>
            </section>

            <section className="featured">
                <div className="secTop">
                    <div className="heroSubTop">
                        <div className="rArrow rL">
                            <img src={line} alt="" />
                        </div>
                        <h2>TOURNAMENT BRIEF</h2>
                        <div className="rArrow rR">
                            <img src={line} alt="" />
                        </div>
                    </div>
                    <h1>
                        Check out OUR upcoming tournaments
                    </h1>
                </div>

                <div className="cardWrap">
                    {
                        toruOuery.data ? (
                            toruOuery.data.map((item, index) => {
                                return (
                                    index < 3 ? (
                                        <Card payload={item} key={"1" + item} />
                                    ) : null
                                )
                            })
                        ) : (
                            <h2>No Tournaments Yet</h2>
                        )
                    }
                </div>
            </section>


            {/* memebership section */}

            <section className="membership">
                <div className="secTop">
                    <div className="heroSubTop">
                        <div className="rArrow rL">
                            <img src={line} alt="" />
                        </div>
                        <h2>Membership Packages</h2>
                        <div className="rArrow rR">
                            <img src={line} alt="" />
                        </div>
                    </div>
                    <h1>
                        Choose a package that suits you
                    </h1>
                </div>


                <div className="prices">
                    {
                        plans.map((item, index) => {
                            console.log(item)
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

                                        <Link to={`/signup?pl="${item.title.split(" ").join("-")}"&pay=${JSON.stringify(
                                            {
                                                type: "Membership Package",
                                                plan: item.title,
                                                price: item.priceNGN,
                                                duration: item.duration,
                                                key: item.duration,
                                            }
                                        )}`}>
                                            <div className="priceButton">
                                                <p>{index <= 0 ? "Join for Free " : "Subscribe"}</p>
                                            </div>
                                        </Link>
                                    </div>

                                </div>
                            )
                        })
                    }
                </div>
            </section>

            <section className="pair">
                <div className="aboutWrap">
                    <div className="aboutInfoSecPrice">
                        <div className="heroSubTop">
                            <div className="rArrow rL">
                                <img src={line} alt="" />
                            </div>
                            <h2>Student-Coaches Pairing</h2>
                            <div className="rArrow rR">
                                <img src={line} alt="" />
                            </div>
                        </div>
                        <h1>
                            {content?.homePageCoachTitle || "Find Your Perfect Coach"}
                        </h1>
                        <p>
                            Our skilled coaches specialize in training amateur players to elevate their game and build confidence on the court. For those with professional ambitions, we offer specialized programs and connections with international tennis organizations, giving talented players the platform to compete and succeed on a global stage.

                        </p>
                        <div className="aboutAction">
                            <Link to="/coaching">

                                <Button>Find a Coach</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="aboutImg pairImg">

                    </div>
                </div>
            </section>


            <Reviews />

            <section className="news">
                <div className="secTop">
                    <div className="heroSubTop">
                        <div className="rArrow rL">
                            <img src={line} alt="" />
                        </div>
                        <h2>sign-up to our newsletter</h2>
                        <div className="rArrow rR">
                            <img src={line} alt="" />
                        </div>
                    </div>
                    <h1>
                        Stay up to date on atp activities and events
                    </h1>
                </div>

                <div className="newsP">
                    <p>
                        We&apos;re obsessed with tennis, and we want to share that obsession with you! Our newsletter is the perfect way to stay connected to the tennis world, with:
                        <br /><br />
                        -  Early access to events & exclusive discounts <br />
                        - Pro tips to level up your game <br />
                        - Latest news & behind-the-scenes fun <br />
                    </p>
                </div>

                <div className="newsInput">
                    <div className="inputN">
                        <input type="text" placeholder="Your Email Address" />
                        <Button>Join Our Mailing List</Button>
                    </div>
                </div>
            </section>
            <div className="newWall">

            </div>
        </>
    )
}