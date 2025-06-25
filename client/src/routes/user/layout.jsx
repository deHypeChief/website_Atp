import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../../libs/images/logoColor.svg"
import "../../libs/styles/userLayout.css"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../libs/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { getMe, getPayMe } from "../../libs/api/api.endpoints";


import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Icon } from "@iconify/react/dist/iconify.js";
import badge from "/shield.svg"

dayjs.extend(relativeTime);




export default function DashboardLayout() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()


    useEffect(() => {
        document.getElementsByTagName("nav")[0].style.display = "none"
        document.getElementsByTagName("footer")[0].style.display = "none"
    }, [])
    const { userLogout } = useAuth();



    const { data } = useQuery({
        queryFn: () => {
            async function moreFn() {
                const payload = {
                    user: await getMe(),
                    billing: await getPayMe(),
                }
                console.log(payload);
                return payload
            }
            return moreFn()
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        queryKey: ["moreData"]
    })

    function hamFunction() {
        document.getElementById("hamSide").style.display = open ? "flex" : null
        setOpen(!open)
    }

    useEffect(() => {
        document.getElementById("dContent")?.addEventListener('click', () => {
            document.getElementById("hamSide").style.display = open ? "flex" : null
            setOpen(!open)
        })
    }, [open])


    useEffect(() => {
        async function checkAuth() {
            const auth = await isAuthenticated()
            if (!auth) {
                navigate("/login")
            }
        }
        checkAuth()
    }, [])

    return (
        <div className="useNov">
            <div className="dashTopNav">
                <div className="logoTop">
                    <div className="logoc">
                        <img src={logo} alt="" />
                    </div>
                </div>
                <div className="upUserInfo">
                    {
                        data?.billing.data.membership.plan === "none" ? <></> : (
                            <div className="badge"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginRight: "10px"
                                }}>
                                <img src={badge} alt="" />
                            </div>
                        )
                    }

                    <div className="userRound">
                        {
                            data?.user?.picture ? (
                                <img src={data.user.picture} />
                            ) : <p>{data?.user?.fullName.split(" ")[0].split("")[0]}</p>
                        }
                    </div>
                    <div className="membershipPill">
                        <p style={{ textTransform: "capitalize" }}>
                            {data?.billing?.data?.training?.plan && data.billing.data.training.plan !== "none"
                                ? `${data.billing.data.training.plan} Training Plan`
                                : "No Training Plan"}
                        </p>
                    </div>
                </div>

                <div className="ham" onClick={hamFunction}>
                    <Icon icon="gg:menu" width="40px" height="40px" style={{ color: "black" }} />
                </div>
            </div>

            <div className="dashboardSection">

                <div className="sideContent" id="hamSide">

                    <div className="sdeTopContent">
                        <Link to={"/u"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname === "/u" ? "active" : "sc_BttnClosed"}`}>
                                <p>Your Overview</p>
                            </div>
                        </Link>
                        <Link to={"/u/coach"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("coach") ? "active" : "sc_BttnClosed"}`}>
                                <p>Your Coach</p>
                            </div>
                        </Link>
                        <Link to={"/u/tickets"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("tickets") ? "active" : "sc_BttnClosed"}`}>
                                <p>Tickets</p>
                            </div>
                        </Link>
                        <Link to={"/u/tournaments"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("tournaments") ? "active" : "sc_BttnClosed"}`}>
                                <p>Tournaments</p>
                            </div>
                        </Link>
                        <Link to={"/u/notifications"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("notifications") ? "active" : "sc_BttnClosed"}`}>
                                <p>Notifications</p>
                            </div>
                        </Link>
                        <Link to={"/u/billings"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("billings") ? "" : "sc_BttnClosed"}`}>
                                <p>Billings</p>
                            </div>
                        </Link>
                        {/* <div className={`sideContent_Bttn ${slide != 2 && "sc_BttnClosed"}`} onClick={() => { setSlide(2) }}>
                                    <p>Your Coach</p>
                                </div> */}
                    </div>

                    <div className="sideBottomContent">
                        <Link to={"/login"} onClick={() => {
                            userLogout()
                            document.getElementsByTagName("nav")[0].style.display = "block"
                            document.getElementsByTagName("footer")[0].style.display = "block"
                        }}>
                            <div className="sideContent_Bttn sc_BttnClosed">
                                <p>Logout</p>
                            </div>
                        </Link>
                    </div>

                </div>
                <div className="dashboardContent" id="dContent">
                    <Outlet />
                </div>
            </div>

        </div>
    )
}