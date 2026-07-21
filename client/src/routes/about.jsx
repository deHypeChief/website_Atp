import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/about.css"


import heroImg from "../libs/images/main/IMG_2800.jpg"
import heroImg2 from "../libs/images/main/IMG_2809.jpg"
import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "../libs/api/api.endpoints";

export default function About() {
    const { data } = useQuery({ queryKey:["site-content"], queryFn:getSiteContent });
    const about = data?.pages || {};
    return (
        <>
            <Hero title={about?.aboutStoryHeader || "About us"} subTitle={"Who and what we are"} imageUrl={about?.aboutPageImg || heroImg} noAction />

            <section className="aboutInfoBig">
                <h1>
                    We’re on a mission to make tennis
                    accessible and rewarding
                    for everyone, fostering
                    a community where passion and skill
                    thrive.
                </h1>
            </section>


            <section className="ourStory">
                <div className="storywrap">
                    <div className="storyText">
                        <h1>{about?.aboutStoryHeader || "Our Story"}</h1>
                        {about?.aboutStoryText ? <p style={{whiteSpace:"pre-line"}}>{about.aboutStoryText}</p> : <>
                        <p>
                            At ATP, we believe tennis is more than just a sport; it’s a lifestyle and a lifelong pursuit of mastery. That’s why we offer high-quality training tailored to each player’s unique level and goals. Whether you’re a complete beginner discovering the thrill of tennis for the first time, or an experienced player looking to polish your technique, ATP provides the guidance, resources, and community support to help you reach new heights.

                        </p>
                        <br /><br />
                        <p>
                            What makes ATP special is our inclusive, welcoming community. Here, anyone—male or female, young or seasoned—can experience the joy of tennis. We are proud to serve players at our premium training locations, including Transcorp Hilton, Rockview Hotels (Royale), and the Moshood Abiola National Stadium, providing state-of-the-art facilities for training and recreation.

                        </p></>}
                    </div>
                    <div className="storyImg" style={about?.aboutPageImg ? {backgroundImage:`url(${about.aboutPageImg})`} : undefined}>

                    </div>
                </div>
            </section>

            <section className="aims">
                <div className="aimfBox">
                    <h1>{about?.aboutVisionHeader || "Our Vision"}</h1>
                    <p>
                        {about?.aboutVisionText || ""}

                    </p>
                </div>
                <div className="aimfBox">
                    <h1>{about?.aboutMissionHeader || "Our Mission"}</h1>
                    <p>
                        {about?.aboutMissionText || ""}
                    </p>
                </div>
            </section>


            {/* <section className="teams">
                <div className="teamText">
                    <h1>Our Team</h1>
                    <p>
                        {about?.teamText || ""}

                    </p>
                </div>

                <div className="teamCards">
                    <Card teamCard />
                    <Card teamCard />
                    <Card teamCard />
                </div>
            </section> */}

            <Hero
                title={"Don’t just think, just do it."}
                imageUrl={heroImg2}
                altText={"Contact Us"}
                altLink={"/contact"}
            // text={"Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat."}
            />

        </>
    )
}
