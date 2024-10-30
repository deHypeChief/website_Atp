import Button from "../button/button";
import "./style.css"
import line from "../../libs/images/Line.png"
import {Link} from "react-router-dom"

export default function Hero({ title, subTitle, text, noAction, altText, imageUrl, pos }) {
    return (
        <section className="hero" style={{ 
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: pos || "center",
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}>
            <div className="heroWrap">
                {
                    !subTitle ? null : (
                        <div className="heroSubTop">
                            <div className="rArrow rL">
                                <img src={line} alt="" />
                            </div>
                            <h2>{subTitle}</h2>
                            <div className="rArrow rR">
                                <img src={line} alt="" />
                            </div>
                        </div>
                    )
                }
                <h1>{title}</h1>
                {
                    text ? (
                        <p>{text}</p>
                    ) : null
                }
                {
                    noAction ? null : (
                        <div className="heroAction">
                            <Link to="/signup">
                                <Button>Get Started</Button>
                            </Link>
                            <Button alt>{altText ? altText : "Learn More"}</Button>
                        </div>
                    )
                }
            </div>
        </section>
    )
}