import Button from "../button/button"
import "./style.css"
export default function BlogCard({title}){
    return(
        <>
            <div className="bCard">
                <div className="bTop">
                    <p>{title}</p>
                </div>
                <div className="vBoxbb">

                </div>
                <Button full alt>Read this article on Medium</Button>
            </div>
        </>
    )
}