import { Link, useLocation } from "react-router-dom"
import './style.css'
import Button from "../button/button"
import logo from "../../libs/images/logo.svg"
import logo2 from "../../libs/images/logoColor.svg"
import { Icon } from "@iconify/react"

import { useEffect, useState } from "react"
import useScrollToTop from "../../libs/hooks/use-scrollTop"
import { useCart } from "../../libs/store/cart"
import { useAuth } from "../../libs/hooks/use-auth"

export default function Navbar() {
    const { count } = useCart()
    const { user } = useAuth()
    const location = useLocation()
    const currentUser = user()
    const profileName = currentUser?.fullName?.trim() || currentUser?.username?.trim() || "Player"
    const firstName = profileName.split(/\s+/)[0]
    const initial = firstName.charAt(0).toUpperCase()
    const [open, setOpen] = useState(false)
    useScrollToTop()
    const link = [
        {
            name: "Home",
            link: "/"
        },
        {
            name: "About",
            link: "/about"
        },
        {
            name: "Tournaments",
            link: "/tournaments"
        },
        {
            name: "Coaching",
            link: "/coaching"
        },
        {
            name: "News",
            link: "/news"
        },
        {
            name: "Shop",
            link: "/shop"
        },
        // {
        //     name: "Video Library",
        //     link: "/videos"
        // },
        {
            name: "Contact Us",
            link: "/contact"
        },
    ]

    const [triggered, setTriggered] = useState(true);

    // 

    useEffect(() => {
        // Function to check if the current URL includes "/contact"
        const isContactPage = window.location.href.includes("/contact");
        const isSignUp = window.location.href.includes("/signup");
        const isLogin = window.location.href.includes("/login");

        // Set triggered state based on the URL when the component loads
        if (isContactPage || isSignUp || isLogin) {
            setTriggered(true);
        } else {
            setTriggered(false);
        }



        // Handle scroll event
        const handleScroll = () => {
            if (isContactPage || isSignUp || isLogin) {
                // If on contact page, always trigger
                setTriggered(true);
            } else {

                // Calculate trigger point based on viewport height (90% of the height)
                const triggerPoint = window.innerHeight * 0.9;
                const scrollPosition = window.scrollY;

                // Set triggered state based on the scroll position
                setTriggered(scrollPosition > triggerPoint);
            }
        };

        if (open == false) {
            handleScroll()
        }



        // Add event listener for scroll
        window.addEventListener('scroll', handleScroll);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [open]);

    if (location.pathname === "/u" || location.pathname.startsWith("/u/")) {
        return null
    }

    return (
        <nav style={{ background: "white" }}>
            <div className="navbar">
                <Link to={"/"}>
                    <div className="logo">
                        <img src={logo2} alt="" />
                    </div>
                </Link>
                <div className="navList">
                    {
                        link.map((item, index) => (
                            <ul key={`${item}+${index}`}>
                                <Link style={{ color: "black" }} to={item.link}>{item.name}</Link>
                            </ul>
                        ))
                    }
                </div>
                <div className="navAction">
                    <Link to="/cart" style={{color:"#073f6d",fontWeight:800,marginRight:16}}>Cart ({count})</Link>
                    {currentUser ? <Link className="navProfile" to="/u" aria-label={`Open ${profileName}'s account`}>
                        <span className="navProfileAvatar">{currentUser.picture ? <img src={currentUser.picture} alt=""/> : initial}</span>
                        <span className="navProfileName">{firstName}</span>
                    </Link> : <Link to="/login">
                        <Button>Login</Button>
                    </Link>}
                </div>
                <div className="hamBox" onClick={() => {
                    setOpen(!open)
                    // setTriggered(!triggered);
                }}>
                    {
                        !open ? (
                            <Icon icon="gg:menu" width="40px" height="40px" style={{ color: "black" }} />
                        ) : (
                            <Icon icon="gg:close" width="40px" height="40px" style={{ color: "black" }} />
                        )
                    }
                </div>
            </div>
            {
                open ? (
                    <div className="hamList">
                        {
                            link.map((item) => (
                                <ul key={item} onClick={() => setOpen(!open)}>
                                    <Link to={item.link}>{item.name}</Link>
                                </ul>
                            ))
                        }
                        {currentUser ? <Link className="mobileProfile" to="/u" onClick={()=>setOpen(false)}>
                            <span className="navProfileAvatar">{currentUser.picture ? <img src={currentUser.picture} alt=""/> : initial}</span>
                            <span><small>Signed in as</small><strong>{profileName}</strong></span>
                        </Link> : <><Link to={"/signup"} onClick={() => {
                            setOpen(!open)
                        }}>
                            <Button full >Get Started</Button>
                        </Link>

                        <Link to={"/login"} onClick={() => {
                            setOpen(!open)
                        }}>
                            <Button full >Login</Button>
                        </Link></>}
                    </div>

                ) : null
            }
        </nav>
    )
}
