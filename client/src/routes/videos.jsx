import Button from "../components/button/button";
import Hero from "../components/hero/hero";
import VideoCard from "../components/videoCard/videoCard";
import "../libs/styles/videos.css"
import img from "../libs/images/main/IMG_3243.jpg";


export default function Videos() {
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
            <Hero title="Video Library (Instructional Content)" subTitle={"Practice at your convinience"} imageUrl={img}/>

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

                {/* <div className="sercBox">
                    <p>You can’t find a video? Use the search button to look for specific videos</p>
                    <div className="inputN">
                        <input type="text" placeholder="Your Email Address" />
                        <Button>Join Our Mailing List</Button>
                    </div>
                </div> */}

                <div className="vbo">
                    <VideoCard name="How to hit a proper back hand"/>
                    <VideoCard name="How to hit a proper back hand"/>
                    <VideoCard name="How to hit a proper back hand"/>
                </div>
            </section>
        </>
    )
}