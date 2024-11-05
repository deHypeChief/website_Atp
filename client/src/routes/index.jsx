import Button from "../components/button/button"
import Card from "../components/card/card"
// import line2 from "../libs/images/Line.png"
import line from "../libs/images/Line2.png"
import "../libs/styles/home.css"
import heroImg from "../libs/images/main/IMG_2855.jpg"
import Hero from "../components/hero/hero"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getTour } from "../libs/api/api.endpoints"
import { client, urlFor } from "../sanityClient"
import { useEffect, useState } from "react"
import Reviews from "../components/reviews/review"

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
                    console.log(data)
                    setContent(data)
                })
                .catch(console.error)
        }
        getContent()
    }, [])

    const plans = [
        {
            title: "Children's Plan",
            des: "This plan is sub-divided into two (2) packages:",
            link: "/membership/children"
        },
        {
            title: "Adult Plan",
            des: "This plan is sub-divided into three (3) packages",
            link: "/membership/adult"
        },
        {
            title: "Special Combo",
            des: "Description for the beginner package will be placed here",
            link: "/membership/combo"
        }
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
                            <h2>ABOUT AMATUER TENNIS PRO</h2>
                            <div className="rArrow rR">
                                <img src={line} alt="" />
                            </div>
                        </div>
                        <h1>
                            {content?.homePageAboutTitle || "Quality Course, Confident Ball"}
                        </h1>
                        <p>
                            {content?.homePageAboutText || `Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                            <br />
                            <br />
                            Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.`}
                        </p>
                        <div className="aboutAction">
                            <Button>Learn More</Button>
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
                        <h2>ABOUT AMATUER TENNIS PRO</h2>
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
                                        <Card payload={item} />
                                    ) : null
                                )
                            })
                        ) : (
                            <h2>No Tournaments Yet</h2>
                        )
                    }
                </div>
            </section>

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
                            return (
                                <div key={"pri" + index} className="priceBox">
                                    <div className="pTextHead">
                                        <h3>{item.title}</h3>
                                        <p>
                                            {item.des}
                                        </p>
                                    </div>

                                    <Link to={item.link}>
                                        {
                                            index === 1 ? (
                                                <Button full alt green>View Plan</Button>
                                            ) : (
                                                <Button full alt blue>View Plan</Button>
                                            )
                                        }
                                    </Link>
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
                            <h2>Student-Teacher Pairing</h2>
                            <div className="rArrow rR">
                                <img src={line} alt="" />
                            </div>
                        </div>
                        <h1>
                            {content?.homePageCoachTitle || "Find Your Perfect Coach"}
                        </h1>
                        <p>
                            {content?.homePageCoachText || `Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                            Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.`}
                        </p>
                        <div className="aboutAction">
                            <Button>Find a Coach</Button>
                        </div>
                    </div>
                    <div className="aboutImg pairImg">

                    </div>
                </div>
            </section>


            <Reviews/>

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