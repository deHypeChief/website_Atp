import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/coaching.css"
import img from "../libs/images/main/IMG_3302.jpg";


export default function Coaching() {
    return (
        <>
            <Hero title={"Student-Teacher Pairing System"} subTitle={"GET trained by the best of the best"} imageUrl={img}/>

            <section className="upcomings">
                <div className="upComs">
                    <h1>Browse Teachers</h1>
                </div>

                <div className="conBox">
                    <Card altCard payload={
                        {
                            name: "bing",
                            exp: "chio",
                            type: "on Chi",
                            rating: "fu-hon"
                        }
                    } />
                </div>
            </section>

            <section className="pair">
            
            <div className="upComs bonm">
                    <h1>Student Testimonials and Reviews</h1>
                </div>
                <div className="aboutWrap">
                    <div className="aboutImg">

                    </div>
                    <div className="testimoney">
                        <div className="testInfo">
                            <p>
                                <i>
                                    &quot;
                                    Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                                    <br /><br />
                                    Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                                    &quot;
                                </i>
                            </p>

                            <div className="person">
                                <h4>Stacy Ajebo</h4>
                                <p>Bank Manager</p>
                            </div>
                        </div>
                        <div className="aboutAction">
                            <div className="tesAction">

                            </div>
                            <div className="tesDots">
                                <div className="aDot active"></div>
                                <div className="aDot"></div>
                                <div className="aDot"></div>
                                <div className="aDot"></div>
                                <div className="aDot"></div>
                            </div>
                            <div className="tesAction">

                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}