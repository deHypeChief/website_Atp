import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Button from "../../components/button/button";
import logo from "../../libs/images/logoColor.svg"
import "../../libs/styles/userLayout.css"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../libs/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { getMatches, getMe, uploadProfile } from "../../libs/api/api.endpoints";

import raIcon1 from "../../libs/images/Group 1.svg";
import raIcon2 from "../../libs/images/Vector-1.svg";
import raIcon3 from "../../libs/images/Vector.svg";
import raIcon4 from "../../libs/images/Group.svg";

import { QRCodeCanvas } from 'qrcode.react';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from 'axios';


dayjs.extend(relativeTime);




export default function DashboardLayout() {
    const [handleMem, setHandleMem] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { isAuthenticated, userLogout } = useAuth()


    useEffect(() => {
        document.getElementsByTagName("nav")[0].style.display = "none"
        document.getElementsByTagName("footer")[0].style.display = "none"
    }, [])
    


    const { data } = useQuery({
        queryFn: () => {
            async function moreFn() {
                const payload = {
                    user: await getMe(),
                    matches: await getMatches(),
                    leaderboard: []
                }
                console.log(payload);
                return payload
            }
            return moreFn()
        },
        queryKey: ["moreData"]
    })

    function navReset() {
        document.getElementsByTagName("nav")[0].style.display = "block"
        document.getElementsByTagName("footer")[0].style.display = "block"
    }


    useEffect(() => {
        async function checkAuth() {
            const auth = await isAuthenticated()
            if (!auth) {
                navigate("/login")
            }
        }
        checkAuth()
    }, [isAuthenticated, navigate])
    return (
        <div className="useNov">
            <div className="dashTopNav">
                <div className="logoTop">
                    <div className="logoc">
                        <img src={logo} alt="" />
                    </div>
                </div>
                <div className="upUserInfo">
                    <div className="userRound">
                        {
                            data?.user?.picture ? (
                                <img src={data.user.picture} />
                            ) : <p>{data?.user?.fullName.split(" ")[0].split("")[0]}</p>
                        }
                    </div>
                    <div className="membershipPill">
                        <p>No Traning Plan</p>
                    </div>
                </div>
            </div>
            <Outlet />
        </div>
    )
}