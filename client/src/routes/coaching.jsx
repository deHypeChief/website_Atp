import Card from "../components/card/card";
import Hero from "../components/hero/hero";
import "../libs/styles/coaching.css"
import img from "../libs/images/imgUpdate/IMG-20241208-WA0039.jpg";
import Reviews from "../components/reviews/review";
import { useQuery } from "@tanstack/react-query"
import { getCoaches } from "../libs/api/api.endpoints";



export default function Coaching() {
    const coachQuery = useQuery({
        queryFn: async () => {
            return getCoaches();
        },
        queryKey: ["coachesMem"]
    });
    return (
        <>
        <div className="heroCoach">
            
        </div>
            <Hero title={"Student-Coach Pairing System"} subTitle={"Get trained by the best of the best"} imageUrl={img} />

            <section className="upcomings">
                <div className="upComs">
                    <h1>Our Coaches</h1>
                </div>

                <div className="conBox">
                    {
                        coachQuery.data?.map((item, i) => {
                            return (
                                <Card key={"c" + i} altCard payload={
                                    {
                                        imageUrl: item.imageUrl,
                                        name: item.coachName,
                                        rating: item.avgRate,
                                        type: item.level,
                                        id: item._id
                                    }
                                } />
                            )
                        })
                    }

                </div>
            </section>


            <Reviews />
        </>
    )
}