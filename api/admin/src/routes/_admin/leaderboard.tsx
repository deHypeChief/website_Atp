import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from '@tanstack/react-router'
import "../../assets/style/routes/leadership.css"
import { useQuery } from '@tanstack/react-query';
import { getLeaders } from '@/apis/endpoints';

export const Route = createFileRoute('/_admin/leaderboard')({
    component: () => <Leaderboard />,
})

function Leaderboard() {
    const { data } = useQuery({
        queryFn: getLeaders,
        queryKey: ["leaders"]
    })

    console.log(data)

    return (
        <>
            <div className="leaderboard">
                <Header title='Leaderboard' subText='An overview of the win rankings from tournaments'></Header>

                <div className="userContent">
                    <div className="ledCards">
                        {
                            data?.map((item, index) => {
                                return (
                                    <Card className='lCard'>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <div className="mHeader">
                                                <div className="tourImg" style={{
                                                    overflow: "hidden"
                                                }}>
                                                    <img src={item.tour.tournamentImgURL} alt="" />
                                                </div>

                                                <div className="tinyFaces">
                                                    <div className="faces">
                                                        {
                                                            item.gold.picture !== "" ? <img src={item.gold.picture} alt="" /> : <p className="pText">{item.gold.fullName.split("")[0]}</p>
                                                        }
                                                    </div>
                                                    <div className="faces">
                                                        {
                                                            item.silver.picture !== "" ? <img src={item.silver.picture} alt="" /> : <p className="pText">{item.silver.fullName.split("")[0]}</p>
                                                        }
                                                    </div>
                                                    <div className="faces">
                                                        {
                                                            item.bronze.picture !== "" ? <img src={item.bronze.picture} alt="" /> : <p className="pText">{item.bronze.fullName.split("")[0]}</p>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardTitle className="text-sm font-medium">{item.tour.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{new Date(item.tour.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}