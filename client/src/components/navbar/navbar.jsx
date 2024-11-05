import { Link } from "react-router-dom"
import './style.css'
import Button from "../button/button"
import logo from "../../libs/images/logo.svg"
import logo2 from "../../libs/images/logoColor.svg"
import { Icon } from "@iconify/react"

import { useEffect, useState } from "react"

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const link = [
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
        // {
        //     name: "Resources",
        //     link: "/resources"
        // },
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
                                <Link style={{ color:  "black" }} to={item.link}>{item.name}</Link>
                            </ul>
                        ))
                    }
                </div>
                <div className="navAction">
                    <Link to="/signup">
                        <Button>Get Started</Button>
                    </Link>
                </div>
                <div className="hamBox" onClick={() => {
                    setOpen(!open)
                    // setTriggered(!triggered);
                }}>
                    <Icon icon="gg:menu" width="40px" height="40px" style={{ color: "black"}} />
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
                        <Link to={"/signup"} onClick={() => {
                            setOpen(!open)
                        }}>
                            <Button full >Get Started</Button>
                        </Link>
                    </div>

                ) : null
            }
        </nav>
    )
}