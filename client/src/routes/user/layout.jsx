import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import Button from "../../components/button/button";
import logo from "../../libs/images/logoColor.svg"
import "../../libs/styles/userLayout.css"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../libs/hooks/use-auth"


export default function DashboardLayout() {
    useEffect(() => {
        document.getElementsByTagName("nav")[0].style.display = "none"
        document.getElementsByTagName("footer")[0].style.display = "none"
    }, [])
    const navigate = useNavigate()
    const { isAuthenticated, userLogout } = useAuth()


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
                    {/* <h2>Hello, {user()?.fullName}.</h2> */}
                </div>
                <div className="navAction">
                    <Link to={"/login"} onClick={() => {
                        userLogout()
                        document.getElementsByTagName("nav")[0].style.display = "block"
                        document.getElementsByTagName("footer")[0].style.display = "block"
                    }}>
                        <Button >Logout</Button> 
                    </Link>
                </div>
            </div>
            <Outlet />
        </div>
    )
}