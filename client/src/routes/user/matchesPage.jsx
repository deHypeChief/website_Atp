import { useQuery } from "@tanstack/react-query";
import { getUserMatchesC } from "../../libs/api/api.endpoints";

function MatchesPage() {
    const { data } = useQuery({
        queryKey: ["userMatches"],
        queryFn: getUserMatchesC(),
        staleTime: Infinity, // Matches data doesn't change frequently
    });

    return (
        <div className="coContent">
            <div className="header">
                <h1>Your Matches</h1>
                <p>List of your matches</p>
            </div>

            <div className="eWrap">
                <div className="ebound eSplit">
                    <div className="cleft">
                        <p>Matches Played</p>
                        <h1>{0}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MatchesPage;