import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../../libs/images/logoColor.svg"
import "../../libs/styles/userLayout.css"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../libs/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { getBillingPage } from "../../libs/api/api.endpoints";


import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Icon } from "@iconify/react/dist/iconify.js";
import badge from "/shield.svg"

dayjs.extend(relativeTime);




export default function DashboardLayout() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
        const footer = document.getElementsByTagName("footer")[0]
        if (footer) footer.style.display = "none"
        return () => { if (footer) footer.style.display = "" }
    }, [])
    const { userLogout } = useAuth();



    const { data: billingPage, isError: billingError } = useQuery({
        queryFn: getBillingPage,
        staleTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
        queryKey: ["billing-page-v2"]
    })
    const data = { user: billingPage?.user, billing: billingPage?.billing }

    function hamFunction() {
        const sidebar = document.getElementById("hamSide")
        if (sidebar) sidebar.style.display = open ? "flex" : ""
        setOpen(!open)
    }

    // useEffect(() => {
    //     document.getElementById("dContent")?.addEventListener('click', () => {
    //         document.getElementById("hamSide").style.display = open ? "flex" : null
    //         setOpen(!open)
    //     })
    // }, [open])


    useEffect(() => {
        if (billingError) navigate("/login")
    }, [billingError, navigate])

    return (
        <div className="useNov">
            <div className="dashTopNav">
                <div className="logoTop">
                    <Link to="/">
                        <div className="logoc">
                            <img src={logo} alt="" />
                        </div>
                    </Link>
                </div>
                <div className="upUserInfo">
                    {
                        data?.billing?.data?.membership?.plan === "none" || !data?.billing ? <></> : (
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
                        {/* <p>Home</p> */}
                        {
                            data?.user?.picture ? (
                                <img src={data.user.picture} />
                            ) : <p>{(data?.user?.fullName || data?.user?.username || "A").trim().charAt(0).toUpperCase()}</p>
                        }
                    </div>
                    <div className="membershipPill">
                        <p style={{ textTransform: "capitalize" }}>
                            {data?.billing?.data?.training?.plan && data?.billing?.data?.training?.plan !== "none"
                                ? `${data?.billing?.data?.training?.plan} Training Plan`
                                : "No Training Plan"}
                        </p>
                    </div>
                    <Link to={"/"}>
                        <div className="membershipPill">
                            <p style={{ textTransform: "capitalize" }}>
                                Go Home
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="ham" onClick={hamFunction}>
                    <Link to="/">Home</Link>
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
                        {/* <Link to={"/u/matches"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("matches") ? "active" : "sc_BttnClosed"}`}>
                                <p>Matches</p>
                            </div>
                        </Link> */}
                        <Link to={"/u/tournaments"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("tournaments") ? "active" : "sc_BttnClosed"}`}>
                                <p>Tournaments</p>
                            </div>
                        </Link>
                        <Link to={"/u/orders"} onClick={hamFunction}>
                            <div className={`sideContent_Bttn ${location.pathname.includes("orders") ? "active" : "sc_BttnClosed"}`}>
                                <p>Shop Orders</p>
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
