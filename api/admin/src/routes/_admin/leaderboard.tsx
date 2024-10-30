import Header from '@/components/blocks/header/header'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from '@tanstack/react-router'
import "../../assets/style/routes/leadership.css"

export const Route = createFileRoute('/_admin/leaderboard')({
    component: () => <Leaderboard />,
})

function Leaderboard() {
    return (
        <>
            <div className="leaderboard">
                <Header title='Leaderboard' subText='An overview of the win rankings from tournaments'></Header>

                <div className="userContent">
                    <div className="ledCards">
                        <Card className='lCard'>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="lHeader">
                                    <div className="tourImg"></div>
                                    <CardTitle className="text-sm font-medium">{"The Kids Booming Tour"}</CardTitle>
                                </div>
                                {/* {children} */}
                            </CardHeader>
                            <CardContent>
                                {/* <div className="text-2xl font-bold">{"--"}</div> */}
                                <p className="text-xs text-muted-foreground">{"October 12, 2024"}</p>
                                <div className="lButton">
                                    <Button>View</Button>

                                    <div className="tinyFaces">
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='lCard'>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="lHeader">
                                    <div className="tourImg"></div>
                                    <CardTitle className="text-sm font-medium">{"The Kids Booming Tour"}</CardTitle>
                                </div>
                                {/* {children} */}
                            </CardHeader>
                            <CardContent>
                                {/* <div className="text-2xl font-bold">{"--"}</div> */}
                                <p className="text-xs text-muted-foreground">{"October 12, 2024"}</p>
                                <div className="lButton">
                                    <Button>View</Button>

                                    <div className="tinyFaces">
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='lCard'>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="lHeader">
                                    <div className="tourImg"></div>
                                    <CardTitle className="text-sm font-medium">{"The Kids Booming Tour"}</CardTitle>
                                </div>
                                {/* {children} */}
                            </CardHeader>
                            <CardContent>
                                {/* <div className="text-2xl font-bold">{"--"}</div> */}
                                <p className="text-xs text-muted-foreground">{"October 12, 2024"}</p>
                                <div className="lButton">
                                    <Button>View</Button>

                                    <div className="tinyFaces">
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='lCard'>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="lHeader">
                                    <div className="tourImg"></div>
                                    <CardTitle className="text-sm font-medium">{"The Kids Booming Tour"}</CardTitle>
                                </div>
                                {/* {children} */}
                            </CardHeader>
                            <CardContent>
                                {/* <div className="text-2xl font-bold">{"--"}</div> */}
                                <p className="text-xs text-muted-foreground">{"October 12, 2024"}</p>
                                <div className="lButton">
                                    <Button>View</Button>

                                    <div className="tinyFaces">
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='lCard'>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="lHeader">
                                    <div className="tourImg"></div>
                                    <CardTitle className="text-sm font-medium">{"The Kids Booming Tour"}</CardTitle>
                                </div>
                                {/* {children} */}
                            </CardHeader>
                            <CardContent>
                                {/* <div className="text-2xl font-bold">{"--"}</div> */}
                                <p className="text-xs text-muted-foreground">{"October 12, 2024"}</p>
                                <div className="lButton">
                                    <Button>View</Button>

                                    <div className="tinyFaces">
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                        <div className="faces"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}