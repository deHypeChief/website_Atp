import Button from "../components/button/button";
import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/tornaments.css";
import img from "../libs/images/main/IMG_3337.jpg";
import { useQuery } from "@tanstack/react-query"
import { getTour } from "../libs/api/api.endpoints"

export default function Tournament() {
    const toruOuery = useQuery({
        queryFn: getTour,
        queryKey: ["tTour"]
    })
    const tags = [
        "Kids Amatuer",
        "Kids Mid-Level",
        "Kids Professional",
        "Adult Amatuer",
        "Adult Mid-Level",
        "Adult Professional",
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
            <section className="upcomings">
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
            </section>

            {/* leaderboard */}
            <section className="upcomings">
                <div className="upComs">
                    <h1>Tournaments Leaderboard</h1>
                    <p>Choose a level to see the leaders in that category</p>
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
                <div className="meds">
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
                    </div>
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
                            <p>Create Account</p>
                        </div>
                    </div>
                    <div className="regBox">
                        <div className="regText">
                            <h2>Step 3</h2>
                            <p>Create Account</p>
                        </div>
                    </div>
                    <div className="regBox">
                        <div className="regText">
                            <h2>Step 4</h2>
                            <p>Create Account</p>
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
                    <div className="sponBox"></div>
                    <div className="sponBox"></div>
                    <div className="sponBox"></div>
                    <div className="sponBox"></div>
                    <div className="sponBox"></div>
                    <div className="sponBox"></div>
                    <div className="sponBox"></div>
                </div>
            </section>
        </>
    )
}