import { Link } from "react-router-dom";
import "./style.css";

export default function BlogCard({ article, featured = false }) {
    const date = new Intl.DateTimeFormat("en-NG", {
        day: "2-digit", month: "short", year: "numeric"
    }).format(new Date(article.publishedAt || article.createdAt));

    return (
        <article className={`bCard ${featured ? "bCardFeatured" : ""}`}>
            <Link className="bCardImage" to={`/news/${article.slug}`} aria-label={`Read ${article.title}`}>
                {article.imageUrl ? <img src={article.imageUrl} alt="" /> : <span>ATP</span>}
            </Link>
            <div className="bCardContent">
                <div className="bCardMeta"><span>{article.category}</span><time>{date}</time></div>
                <h2><Link to={`/news/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.excerpt}</p>
                <Link className="bCardLink" to={`/news/${article.slug}`}>Read courtside report <span>→</span></Link>
            </div>
        </article>
    );
}
