import Button from "../components/button/button";
import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/tornaments.css";
import img from "../libs/images/main/IMG_3337.jpg";
import { useQuery } from "@tanstack/react-query"
import { getTour } from "../libs/api/api.endpoints"


// images
import img01 from "../libs/images/imgUpdate/IMG-20241205-WA0011.jpg"
import img02 from "../libs/images/imgUpdate/IMG-20241205-WA0012.jpg"
import img03 from "../libs/images/imgUpdate/IMG-20241205-WA0013.jpg"
import img04 from "../libs/images/imgUpdate/IMG-20241205-WA0014.jpg"
import img05 from "../libs/images/imgUpdate/IMG-20241205-WA0016.jpg"
import img06 from "../libs/images/imgUpdate/IMG-20241205-WA0017.jpg"
import img07 from "../libs/images/imgUpdate/IMG-20241205-WA0019.jpg"
import img08 from "../libs/images/imgUpdate/IMG-20241205-WA0020.jpg"
import img09 from "../libs/images/imgUpdate/IMG-20241205-WA0022.jpg"
import img10 from "../libs/images/imgUpdate/IMG-20241205-WA0023.jpg"
import img11 from "../libs/images/imgUpdate/IMG-20241205-WA0024.jpg"
import img12 from "../libs/images/imgUpdate/IMG-20241205-WA0025.jpg"

export default function Tournament() {
    const toruOuery = useQuery({
        queryFn: getTour,
        queryKey: ["tTour"]
    })

    const defaultLeaders = [
        {
            year: 2023,
            info: "June 2023 Winners",
            goldImg: img01,
            silverImg: img02
        },
        {
            year: 2023,
            info: "December 2023 Winners",
            goldImg: img03,
            silverImg: img04
        },
        {
            year: 2024,
            info: "2024 Winners Male",
            goldImg: img05,
            silverImg: img06
        },
        {
            year: 2024,
            info: "2024 Winners Under 14",
            goldImg: img07,
            silverImg: img08
        },
        {
            year: 2024,
            info: "2024 Winners Under 12",
            goldImg: img09,
            silverImg: img10
        },
        {
            year: 2024,
            info: "2024 Winners Female",
            goldImg: img11,
            silverImg: img12
        }
    ]
    const tags = [
        "JUNIORS TENNIS TOURNAMENT",
        "⁠ATP TENNIS TOURNAMENT",
        // "Kids Professional",
        // "Adult Amatuer",
        // "Adult Mid-Level",
        // "Adult Professional",
    ]
    return (
        <>
            <Hero title="Tournaments page" subTitle={"Compete and be among the best"} imageUrl={img} pos="center" />

            {/* upcomin */}
            <section className="upcomings">
                <div className="upComs">
                    <h1>Upcoming Tournaments</h1>
                    <p>Choose your level and will find a tournament that suits you best</p>
                </div>
                <div className="upActions">
                    {
                        tags.map((item) => (
                            <div key={item} className="tAc">
                                <Button>{item}</Button>
                            </div>
                        ))
                    }
                </div>
                <div className="spBoxes">
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

            {/* past tornament */}
            {/* <section className="upcomings">
                <div className="upComs past">
                    <h1>Past Tournaments</h1>
                </div>
                <div className="spBoxes pasrspBox">
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
                <div className="psAction">
                    <Button>Vew Past Tornaments</Button>
                </div>
            </section> */}

            {/* leaderboard */}
            <section className="upcomings">
                <div className="upComs">
                    <h1>Tournaments Leaderboard</h1>
                    <p>Choose a level to see the leaders in that category</p>
                </div>
                <div className="upActions">
                    {/* {
                        tags.map((item) => (
                            <div key={item} className="tAc">
                                <Button>{item}</Button>
                            </div>
                        ))
                    } */}
                </div>
                <div className="meds">
                    {
                        defaultLeaders.map((item, index) => {
                            return (
                                <div className="medBox" key={"ind" + index}>
                                    <div className="topMedText">
                                        <h3>{item.year}</h3>
                                        <p>{item.info}</p>
                                    </div>
                                    <div className="medCatGroup">
                                        <div className="medCat">
                                            <div className="medIcon">
                                                <img src="" alt="" />
                                            </div>
                                            <div className="medRound"
                                                style={{
                                                    background: `url(${item.goldImg})`,
                                                    backgroundSize: 'cover' 
                                                }}
                                            >
                                            </div>
                                        </div>
                                        <div className="medCat">
                                            <div className="medIcon2">
                                                <img src="" alt="" />
                                            </div>
                                            <div className="medRound2"
                                                style={{
                                                    background: `url(${item.silverImg})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPositionX: "center"
                                                }}
                                            >
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                    {/* <div className="medBox">
                        <div className="topMedText">
                            <h3>2019</h3>
                        </div>
                        <div className="medCatGroup">
                            <div className="medCat">
                                <div className="medIcon">
                                    <img src="" alt="" />
                                </div>
                                <div className="medRound">
                                    <img src="" alt="" />
                                </div>
                            </div>
                            <div className="medCat">
                                <div className="medIcon">
                                    <img src="" alt="" />
                                </div>
                                <div className="medRound">
                                    <img src="" alt="" />
                                </div>
                            </div>
                            <div className="medCat">
                                <div className="medIcon">
                                    <img src="" alt="" />
                                </div>
                                <div className="medRound">
                                    <img src="" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="medBox">
                        <div className="topMedText">
                            <h3>2019</h3>
                        </div>
                        <div className="medCatGroup">
                            <div className="medCat">
                                <div className="medIcon">
                                    <img src="" alt="" />
                                </div>
                                <div className="medRound">
                                    <img src="" alt="" />
                                </div>
                            </div>
                            <div className="medCat">
                                <div className="medIcon">
                                    <img src="" alt="" />
                                </div>
                                <div className="medRound">
                                    <img src="" alt="" />
                                </div>
                            </div>
                            <div className="medCat">
                                <div className="medIcon">
                                    <img src="" alt="" />
                                </div>
                                <div className="medRound">
                                    <img src="" alt="" />
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </section>

            {/* registration */}
            <section className="upcomings">
                <div className="upComs">
                    <h1>Tournament Registration</h1>
                    <p>Do you have what it takes to be the next tennis champion for your category in December 2024? Register and secure your spot to compete.</p>
                </div>
                <div className="regWrap">
                    <div className="regBox">
                        <div className="regText">
                            <h2>Step 1</h2>
                            <p>Create Account</p>
                        </div>
                    </div>
                    <div className="regBox">
                        <div className="regText">
                            <h2>Step 2</h2>
                            <p>Become a Member</p>
                        </div>
                    </div>
                    <div className="regBox">
                        <div className="regText">
                            <h2>Step 3</h2>
                            <p>Buy Your Ticket</p>
                        </div>
                    </div>
                    <div className="regBox">
                        <div className="regText">
                            <h2>Step 4</h2>
                            <p>Have Fun</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* sponsorship */}
            <section className="upcomings">
                <div className="upComs">
                    <h1>Sponsorship Opportunities</h1>
                    <p>Do you want to join the list of amazing brands, companies, organizations and individuals sponsoring ATP? Send an email to sponsorship@atp.com</p>
                </div>
                <div className="sporns">
                    <img src="/IMG_2807.jpg" alt="" />
                </div>
            </section>
        </>
    )
}
