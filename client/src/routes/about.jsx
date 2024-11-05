import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/about.css"


import heroImg from "../libs/images/main/IMG_2800.jpg"
import heroImg2 from "../libs/images/main/IMG_2809.jpg"

export default function About() {
    return (
        <>
            <Hero title={"About us"} subTitle={"Who and what we are"} imageUrl={heroImg} noAction />

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
                        <h1>Our Story</h1>
                        <p>
                            Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                            <br /><br />
                            Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                        </p>
                        <br /><br />
                        <p>
                            Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                            <br /><br />
                            Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                        </p>
                    </div>
                    <div className="storyImg">

                    </div>
                </div>
            </section>

            <section className="aims">
                <div className="aimfBox">
                    <h1>Our vision</h1>
                    <p>
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                        <br /><br />
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                    </p>
                    <br /><br />
                    <p>
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                        <br /><br />
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                    </p>
                </div>
                <div className="aimfBox">
                    <h1>Our Mission</h1>
                    <p>
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                        <br /><br />
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                    </p>
                    <br /><br />
                    <p>
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat.
                        <br /><br />
                        Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.
                    </p>
                </div>
            </section>


            <section className="teams">
                <div className="teamText">
                    <h1>Our Team</h1>
                    <p>Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.</p>
                </div>

                <div className="teamCards">
                    <Card teamCard />
                    <Card teamCard />
                    <Card teamCard />
                </div>
            </section>

            <Hero
                title={"Don’t just think, just do it."}
                imageUrl={heroImg2}
                altText={"Contact Us"}
                altLink={"/contact"}
                text={"Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat."}
            />

        </>
    )
}