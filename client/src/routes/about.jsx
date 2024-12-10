import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/about.css"


import heroImg from "../libs/images/main/IMG_2800.jpg"
import heroImg2 from "../libs/images/main/IMG_2809.jpg"

export default function About() {
	const [about, setAbout] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
	const [error, setError] = useState(null);

    useEffect(() => {
		async function getReviews() {
			setLoading(true); // Set loading state to true
			try {
				const data = await client.fetch(`
					*[_type == "atpContent"]
				`);
				setAbout(data);
			} catch (err) {
				setError("Failed to load reviews");
			} finally {
				setLoading(false); // Set loading state to false after fetching is done
			}
		}
		getReviews();
	}, []);
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
                        At ATP, we believe tennis is more than just a sport; it’s a lifestyle and a lifelong pursuit of mastery. That’s why we offer high-quality training tailored to each player’s unique level and goals. Whether you’re a complete beginner discovering the thrill of tennis for the first time, or an experienced player looking to polish your technique, ATP provides the guidance, resources, and community support to help you reach new heights.

                        </p>
                        <br /><br />
                        <p>
                        What makes ATP special is our inclusive, welcoming community. Here, anyone—male or female, young or seasoned—can experience the joy of tennis. We are proud to serve players at our premium training locations, including Transcorp Hilton, Rockview Hotels (Royale), and the Moshood Abiola National Stadium, providing state-of-the-art facilities for training and recreation.

                        </p>
                    </div>
                    <div className="storyImg">

                    </div>
                </div>
            </section>

            <section className="aims">
                <div className="aimfBox">
                    <h1>Our Vision</h1>
                    {about?.aboutVisionText || ""}
                </div>
                <div className="aimfBox">
                    <h1>Our Mission</h1>
                    {about?.aboutMissionText || ""}
                </div>
            </section>


            <section className="teams">
                <div className="teamText">
                    <h1>Our Team</h1>
                    {about?.teamText || ""}
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