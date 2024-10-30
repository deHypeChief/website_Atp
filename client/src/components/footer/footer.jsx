import logo from  "../../libs/images/logo.svg"
import "./style.css"

export default function Footer(){
    return(
        <footer>
            <div className="logoFooter">
                <div className="logoBox">
                    <img src={logo} alt="" />
                </div>
            </div>

            <div className="logoList">
                <div className="lBox">
                    <h4>Quick Links</h4>
                    <p>Home</p>
                    <p>About</p>
                    <p>Memberships</p>
                    <p>Tournaments</p>
                    <p>Coaching</p>
                    <p>Video Library</p>
                    <p>Contact Us</p>
                </div>
                <div className="lBox">
                    <h4>Social Media</h4>
                    <p>Facebook</p>
                    <p>Instagram</p>
                    <p>LinkedIn</p>
                    <p>X (Twitter)</p>
                    <p>YouTube</p>
                </div>

                <div className="lBox">
                    <h4>Legal Information</h4>
                    <p>Privacy Policy</p>
                    <p>Terms of Service</p>
                    <p>Cookie Policy</p>
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