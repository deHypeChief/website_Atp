import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getNewsArticle } from "../libs/api/api.endpoints";
import "../libs/styles/resources.css";

function articleHtml(body = "") {
    if (!/<[a-z][\s\S]*>/i.test(body)) {
        const escaped = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return escaped.split(/\n\n+/).map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("");
    }
    const documentCopy = new DOMParser().parseFromString(body, "text/html");
    const allowedTags = new Set(["P", "BR", "STRONG", "B", "EM", "I", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE", "A"]);
    documentCopy.body.querySelectorAll("*").forEach(element => {
        if (!allowedTags.has(element.tagName)) {
            element.replaceWith(...element.childNodes);
            return;
        }
        [...element.attributes].forEach(attribute => {
            if (element.tagName !== "A" || attribute.name !== "href") element.removeAttribute(attribute.name);
        });
        if (element.tagName === "A") {
            const href = element.getAttribute("href") || "";
            if (!/^https?:\/\//i.test(href)) element.removeAttribute("href");
            else {
                element.setAttribute("target", "_blank");
                element.setAttribute("rel", "noopener noreferrer");
            }
        }
    });
    return documentCopy.body.innerHTML;
}

export default function NewsArticle() {
    const { slug } = useParams();
    const { data: article, isLoading, isError } = useQuery({ queryKey: ["news", slug], queryFn: () => getNewsArticle(slug) });
    if (isLoading) return <main className="articleState">Opening courtside report…</main>;
    if (isError || !article) return <main className="articleState">This report is unavailable. <Link to="/news">View all news</Link></main>;
    const date = new Intl.DateTimeFormat("en-NG", { day:"numeric", month:"long", year:"numeric" }).format(new Date(article.publishedAt || article.createdAt));
    return <main className="articlePage">
        <Link className="articleBack" to="/news">← All tennis news</Link>
        <header><p>{article.category} · {date}</p><h1>{article.title}</h1><div>By {article.author}</div></header>
        {article.imageUrl && <img className="articleHero" src={article.imageUrl} alt="" />}
        <p className="articleLead">{article.excerpt}</p>
        <div className="articleBody" dangerouslySetInnerHTML={{ __html: articleHtml(article.body) }} />
    </main>;
}
