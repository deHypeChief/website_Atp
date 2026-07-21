import logo from "../../libs/images/logo.svg"
import "./style.css"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getSiteContent } from "../../libs/api/api.endpoints"

export default function Footer() {
    const { data } = useQuery({ queryKey:["site-content"], queryFn:getSiteContent })
    const footerData = data?.links
    return (
        <footer>
            <div className="logoFooter">
                <div className="logoBox">
                    <img src={logo} alt="" />
                </div>
            </div>

            <div className="logoList">
                <div className="lBox">
                    <h4>Quick Links</h4>
                    <Link to="/">
                        <p>Home</p>
                    </Link>
                    <Link to="/about">
                        <p>About </p>
                    </Link>
                    <Link to="/tournaments">
                    <p>Tournaments </p>
                    </Link>
                    <Link to="/coaching">
                    <p>Coaching</p>
                    </Link>
                    <Link to="/news">
                        <p>News</p>
                    </Link>
                    <Link to="/contact">
                        <p>Contact Us</p>
                    </Link>
                    {/* <p>Memberships</p> */}
                    {/* <p>Video Library</p> */}
                </div>
                <div className="lBox">
                    <h4>Social Media</h4>
                    <a href={footerData?.facebookLink || "https://www.facebook.com/share/1AMAxGUvo7/?mibextid=wwXIfr"}>
                        <p>Facebook</p>
                    </a>
                    <a href={footerData?.instagramLink || "https://www.instagram.com/amateurtennispro?igsh=MXRtY2IzczRvMW41dg=="}>
                        <p>Instagram</p>
                    </a>
                    {/* <a href={footerData?.linkedinLink || "/"}>
                        <p>LinkedIn</p>
                    </a> */}
                    {/* <a href={footerData?.xLink || "/"}>
                        <p>X (Twitter)</p>
                    </a> */}

                    <a href={footerData?.youtubeLink || "https://youtube.com/@afropowerent?si=K7f88Fwa_se3vakr"}>
                        <p>YouTube</p>
                    </a>
                </div>

                <div className="lBox">
                    <h4>Legal Information</h4>
                    <a href={footerData?.privacyLink || "/"}>
                        <p>Privacy Policy</p>
                    </a>
                    <a href={footerData?.termsLink || "/"}>
                        <p>Terms of Service</p>
                    </a>
                    <a href={footerData?.cookieLink || "/"}>
                        <p>Cookie Policy</p>
                    </a>
                </div>
                <div className="lBox">
                    <h4>Additional Options</h4>
                    <p>Newsletter Signup</p>
                    <p>Affiliate Program</p>
                    <p>Careers</p>
                </div>
            </div>

            <hr />

            <div className="logoCO">
                <div className="coBox"></div>
                <div className="coBox"></div>
                <div className="coBox"></div>
                <div className="coBox"></div>
                <div className="coBox"></div>
                <div className="coBox"></div>
            </div>
        </footer>
    )
}
