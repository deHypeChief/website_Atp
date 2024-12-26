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
    const [openMore, setOpenMore] = useState(false)
    const [showTicket, setShowTicket] = useState(null)
    const [openImageUpload, setImageUpload] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null); // state for the selected image file

    // handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    useEffect(() => {
        document.getElementsByTagName("nav")[0].style.display = "none"
        document.getElementsByTagName("footer")[0].style.display = "none"
    }, [])
    const navigate = useNavigate()
    const { isAuthenticated, userLogout } = useAuth()


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

    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true)

        const formData = new FormData();
        formData.append('file', selectedFile);

        // Request signature from backend
        formData.append('api_key', import.meta.env.VITE_CLOUDINARY_APIKEY);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);

        try {
            // Upload the image to Cloudinary
            const res = await axios.post(
                import.meta.env.VITE_CLOUDINARY_UPLOAD_KEY,
                formData
            );

            const imageUrl = res.data.secure_url;

            if (imageUrl) {
                await uploadProfile(imageUrl)
                alert("Profile image uplaoded.")
                setLoading(false)
            }

        } catch (err) {
            alert("Error uploading profile image.")
            setLoading(false)
            setOpenMore(null)
            setSelectedFile(null)
            console.error(err, "Error uploading image")  // Throw the error so it can be handled upstream
        }
    };

    function navReset() {
        document.getElementsByTagName("nav")[0].style.display = "block"
        document.getElementsByTagName("footer")[0].style.display = "block"
    }

    console.log(data?.user?.plan)


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
                    <Button onClick={() => {
                        setOpenMore(!openMore)
                    }}>{openMore ? "Close" : "More"}</Button>
                </div>
            </div>
            <Outlet />

            {
                openMore && (
                    <section className="moreSection">


                        <div className="moreWrap">
                            <div className="prof">
                                <div className="profCircle">
                                    {
                                        data?.user?.picture ? (
                                            <img src={data.user.picture} />
                                        ) : <h1>{data?.user?.fullName.split(" ")[0].split("")[0]}</h1>
                                    }
                                </div>
                                <Button blue onClick={() => { setImageUpload(!openImageUpload) }}>
                                    Change Profile Image
                                </Button>
                            </div>

                            {
                                openImageUpload && (
                                    <div className="overlayPage">
                                        <div className="overWrap">
                                            <div className="absClose">
                                                <div className="closeIcon" onClick={() => {
                                                    setImageUpload(null)
                                                    setSelectedFile(null)
                                                }}>
                                                    <Icon icon="si:close-duotone" width="40px" height="40px" />
                                                </div>
                                            </div>
                                            <div className="tourCenter">
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                    <div className="formWrapPro">
                                                        <p>Your profile image</p>
                                                        <input type="file" onChange={handleFileChange} required />
                                                    </div>
                                                    <div className="tourAction">
                                                        <Button full onClick={handleUpload} disabled={loading}>
                                                            {loading ? "Uploading Image..." : "Upload Profile Image"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>

                        <div className="wrapTwin">
                            <div className="moreWrap">
                                <h2>Membership Plan</h2>
                                <div className="moreCard">
                                    {
                                        data.user?.membership !== "" ? null : (
                                            <div className="noMember">
                                                <h2>No Membership Plan</h2>
                                                <Button onClick={() => { setHandleMem(true) }}>Become A Member</Button>
                                            </div>
                                        )
                                    }

                                    {
                                        handleMem && (
                                            <div className="overlayPage">
                                                <div className="overWrap">
                                                    <div className="absClose">
                                                        <div className="closeIcon" onClick={() => {
                                                            setHandleMem(null)
                                                        }}>
                                                            <Icon icon="si:close-duotone" width="40px" height="40px" />
                                                        </div>
                                                    </div>
                                                    <div className="tourCenter">

                                                        <div className="pickPlan">
                                                            <h1>Membership Plans</h1>
                                                            <p>Select a plan that works best for you</p>
                                                        </div>
                                                        <Link to={"/membership/children?userSigned=true"} onClick={navReset}>
                                                            <div className="memLinks">
                                                                <h2>Children Plan</h2>
                                                                <p></p>
                                                            </div>
                                                        </Link>
                                                        <Link to={"/membership/adult?userSigned=true"} onClick={navReset}>
                                                            <div className="memLinks">
                                                                <h2>Adult Plan</h2>
                                                                <p></p>
                                                            </div>
                                                        </Link>
                                                        <Link to={"/membership/combo?userSigned=true"} onClick={navReset}>
                                                            <div className="memLinks">
                                                                <h2>Combo Plan</h2>
                                                                <p></p>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        data.user?.membership !== "" && (
                                            <div className="medFound">
                                                <div className="topMemImage">
                                                    <div className="imgMem">
                                                        <img src={data.user.plan?.planId?.planImage} alt="" />
                                                    </div>
                                                    <div className="topMemHold">
                                                        <h2>{data.user.plan?.planId?.planName}</h2>
                                                        <p>{data.user.plan?.planId?.billingPlans[data.user.plan?.planIntervalNumber].billingName}</p>
                                                    </div>
                                                </div>
                                                <div className="memContent">
                                                    <div className="leftMem">
                                                        <div className="memHold">
                                                            <h3>Plan Start</h3>
                                                            <p>{dayjs(data.user.plan?.planStartDate).format('D MMMM, YYYY')}</p>
                                                        </div>
                                                        <div className="memHold">
                                                            <h3>Plan Expires</h3>
                                                            <p>{dayjs(data.user.plan?.renewalDate).format('D MMMM, YYYY')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="leftMem">
                                                        <div className="memHold">
                                                            <h3>Plan Price</h3>
                                                            <p>{data.user.plan?.planId?.billingPlans[data.user.plan.planIntervalNumber].billingPrice}</p>
                                                        </div>
                                                        <div className="memHold">
                                                            <h3>Plan Duration</h3>
                                                            <p>{data.user.plan?.planId?.billingPlans[data.user.plan?.planIntervalNumber].interval} months</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) 
                                    }


                                </div>
                            </div>
                            <div className="moreWrap">
                                <h2>Medals</h2>
                                <div className="moreCard">
                                    {/* {
                                        data.leaderboard?.length <= 0 && (
                                            <div className="noMember">
                                                <h2>No Medals Yet</h2>
                                            </div>
                                        )
                                    } */}

                                    <div className="winWrap">
                                        <div className="winBox">
                                            <div className="winImg">
                                                <img src={'https://img.icons8.com/?size=100&id=syzOyB6IAzZ0&format=png&color=000000'} />
                                            </div>
                                            <h2>{data.matches.medals.gold}</h2>
                                        </div>
                                        <div className="winBox">
                                            <div className="winImg">
                                                <img src={'https://img.icons8.com/?size=100&id=dgAxfaiZaNr6&format=png&color=000000'} />
                                            </div>
                                            <h2>{data.matches.medals.silver}</h2>
                                        </div>
                                        <div className="winBox">
                                            <div className="winImg">
                                                <img src={'https://img.icons8.com/?size=100&id=lMwvkoCmvpSJ&format=png&color=000000'} />
                                            </div>
                                            <h2>{data.matches.medals.bronze}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="moreWrap">
                            <h2>Tickets</h2>
                            <div className="moreCard ticks">
                                {
                                    data.matches?.matches?.length <= 0 && (
                                        <div className="noMember">
                                            <h2>No Tickets Found</h2>
                                            <Link to="/u">
                                                <Button>View Tournaments</Button>
                                            </Link>
                                        </div>

                                    )
                                }

                                <div className="ticWrap">
                                    {
                                        data.matches?.matches?.map((item, index) => (
                                            <>
                                                <div className="bonBox" key={"tour" + index}>
                                                    <div className="bonVor">
                                                        <div className="bonboxN">
                                                            <img src={raIcon1} alt="" />
                                                        </div>
                                                        <p>{item.tournament.name}</p>
                                                    </div>
                                                    <div className="bonVor">
                                                        <div className="bonboxN">
                                                            <img src={raIcon4} alt="" />
                                                        </div>
                                                        <p>{item.tournament.date.split("T")[0]}</p>
                                                    </div>
                                                    <div className="bonVor">
                                                        <div className="bonboxN">
                                                            <img src={raIcon3} alt="" />
                                                        </div>
                                                        <p>{item.tournament.location}</p>
                                                    </div>
                                                    <div className="bonVor">
                                                        <div className="bonboxN">
                                                            <img src={raIcon2} alt="" />
                                                        </div>
                                                        <p>{item.tournament.time}</p>
                                                    </div>

                                                    <div className="comAction">
                                                        <Button full alt blue onClick={() => {
                                                            setShowTicket(item)
                                                        }}>
                                                            View Ticket
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        ))
                                    }
                                </div>

                                {
                                    showTicket && (
                                        <div className="overlayPage">
                                            <div className="overWrap">
                                                <div className="absClose">
                                                    <div className="closeIcon" onClick={() => {
                                                        setShowTicket(null)
                                                    }}>
                                                        <Icon icon="si:close-duotone" width="40px" height="40px" />
                                                    </div>
                                                </div>
                                                <div className="tourCenter">
                                                    <div className="tourImage Bn">
                                                        <div className="qrCode">
                                                            <QRCodeCanvas value={{
                                                                token: showTicket.token,
                                                                name: data.user?.fullName,
                                                                email: data.user?.email,
                                                                tourName: showTicket?.tournament?.name,
                                                                tourId: showTicket?.tournament?._id
                                                            }} size={200} level={"H"} />
                                                        </div>
                                                        {/* Add tournament image here */}
                                                    </div>
                                                    <div className="tourText">

                                                        <h2 className="cetText">{showTicket.token}</h2>

                                                        <p>
                                                            You have succesfully registered for the <span className="tourtextMain">{showTicket?.tournament.name}</span>
                                                        </p>

                                                        <p className="regInfo">
                                                            What you need to know:
                                                        </p>
                                                        <p className="regPoints">Name: {data.user.fullName}</p>
                                                        <p className="regPoints">Date: {dayjs(showTicket.tournament.date).format('D MMMM, YYYY')}</p>
                                                        <p className="regPoints">Venue: {showTicket.tournament.location} </p>
                                                    </div>
                                                    <div className="tourAction">
                                                        {/* <Button full>
                                                    Download Ticket
                                                </Button> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        <div className="moreWrap">
                            <Link to={"/login"} onClick={() => {
                                userLogout()
                                document.getElementsByTagName("nav")[0].style.display = "block"
                                document.getElementsByTagName("footer")[0].style.display = "block"
                            }}>
                                <Button >Logout</Button>
                            </Link>
                        </div>
                    </section>
                )
            }
        </div>
    )
}