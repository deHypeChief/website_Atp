import { useParams } from "react-router-dom"
import VideoCard from "../components/videoCard/videoCard"
import "../libs/styles/coaching.css"
import { getCoach } from "../libs/api/api.endpoints"
import { useQuery } from "@tanstack/react-query"


export default function CoachInfo() {
    const { id } = useParams()
    console.log(id)

    const coachQuery = useQuery({
        queryFn: async () => {
            return getCoach(id);
        },
        queryKey: ["coachesMemId"]
    });
    return (
        <>
            <section className="mo">
                <div className="imgInfo">
                    <img src={coachQuery.data?.imageUrl} alt="" />
                </div>

                <div className="actTop">
                    <h1>{coachQuery.data?.coachName}</h1>
                    <p>
                        {coachQuery.data?.bioInfo}
                    </p>
                </div>

                <br />
            </section>
        </>
    )
}