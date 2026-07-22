/* eslint-disable react/prop-types */
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import "./style.css";

export default function BlogCard({ article, featured = false, headingId }) {
    const rawDate = article.publishedAt || article.createdAt;
    const date = rawDate && !Number.isNaN(new Date(rawDate).getTime())
        ? new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(rawDate))
        : "Courtside report";

    return (
        <article className={`bCard ${featured ? "bCardFeatured" : ""}`}>
            <Link className="bCardImage" to={`/news/${article.slug}`} aria-label={`Read ${article.title}`}>
                {article.imageUrl ? <img src={article.imageUrl} alt="" /> : <span>ATP</span>}
                <span className="bCardImageAction"><Icon icon="solar:arrow-right-up-linear" /></span>
            </Link>
            <div className="bCardContent">
                <div className="bCardMeta"><span>{article.category || "ATP Courtside"}</span><time dateTime={rawDate || undefined}>{date}</time></div>
                <h2 id={headingId}><Link to={`/news/${article.slug}`}>{article.title}</Link></h2>
                {article.excerpt && <p>{article.excerpt}</p>}
                <Link className="bCardLink" to={`/news/${article.slug}`}>Read report <Icon icon="solar:arrow-right-linear" /></Link>
            </div>
        </article>
    );
}
