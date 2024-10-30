import BlogCard from "../components/blogCard/blogCard";
import Hero from "../components/hero/hero";
import "../libs/styles/resources.css"
import img from "../libs/images/main/IMG_3302.jpg";


export default function Resources(){
    return(
        <>
            <Hero title={"Blog and Resources"} subTitle={"Read what we have for you"} noAction imageUrl={img}/>
        
            <section className="blogBox">
                <div className="blogTopText">
                    <h1>Tennis Tips</h1>
                    <p>Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Cras tincidunt ligula ac enim posuere venenatis. In luctus biben dum nisl, in luctus dolor ultrices volutpat. Aenean pulvinar, nisi vitae malesuada efficitur. volutpat justo laoreet sit amet.</p>
                </div>
                <div className="blogWrap">
                    <BlogCard title={"blog title"}/>
                    <BlogCard title={"blog title"}/>
                    <BlogCard title={"blog title"}/>
                    <BlogCard title={"blog title"}/>
                </div>
            </section>
        </>
    )
}