import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import BlogCard from "../components/blogCard/blogCard";
import { Reveal } from "../components/system/system";
import { getNews } from "../libs/api/api.endpoints";
import "../libs/styles/resources.css";
import "../libs/styles/news-v3.css";

export default function Resources() {
    const { data: articles = [], isLoading, isError } = useQuery({ queryKey: ["news"], queryFn: getNews });
    const [activeCategory, setActiveCategory] = useState("All stories");
    const categories = useMemo(() => ["All stories", ...new Set(articles.map((article) => article.category).filter(Boolean))], [articles]);
    const filteredArticles = activeCategory === "All stories" ? articles : articles.filter((article) => article.category === activeCategory);
    const leadStory = filteredArticles[0];
    const deskStories = filteredArticles.slice(1);

    return (
        <main className="newsPage">
            <header className="newsMasthead">
                <Reveal className="newsMastCopy">
                    <p className="newsEyebrow">ATP / Courtside</p>
                    <h1>The game,<br /><span>reported.</span></h1>
                    <p>Match reports, player stories and practical notes from across the ATP community.</p>
                </Reveal>
                <div className="newsMastAside" aria-hidden="true">
                    <Icon icon="solar:tennis-2-linear" />
                    <span>Stories from<br />inside the lines</span>
                </div>
            </header>

            <nav className="newsTicker" aria-label="Filter news by category">
                <span>Browse the desk</span>
                <div>{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
            </nav>

            <section className="newsDesk" aria-live="polite">
                {isLoading && <p className="newsState"><Icon icon="solar:refresh-circle-linear" />Fetching the latest from court…</p>}
                {isError && <p className="newsState"><Icon icon="solar:danger-circle-linear" />News could not be loaded. Please try again shortly.</p>}
                {!isLoading && !isError && !leadStory && <div className="newsCategoryEmpty"><Icon icon="solar:notebook-linear" /><small>{activeCategory === "All stories" ? "ATP Courtside" : activeCategory}</small><h2>{activeCategory === "All stories" ? "The first report is being prepared." : `No ${activeCategory} stories yet.`}</h2><p>{activeCategory === "All stories" ? "Fresh match reports, player stories and training notes will appear here." : "Nothing has been published in this section yet. Check back after the next courtside update."}</p>{activeCategory !== "All stories" && <button type="button" onClick={() => setActiveCategory("All stories")}>View all stories <Icon icon="solar:arrow-right-linear" /></button>}</div>}

                {leadStory && <section className="newsLead" aria-labelledby="lead-story-heading">
                    <div className="newsSectionLabel"><span>Cover story</span><span>Latest report</span></div>
                    <BlogCard article={leadStory} featured headingId="lead-story-heading" />
                </section>}

                {deskStories.length > 0 && <section className="newsLatest" aria-labelledby="latest-stories-heading">
                    <div className="newsSectionLabel"><h2 id="latest-stories-heading">Latest from the desk</h2><span>{String(deskStories.length).padStart(2, "0")} reports</span></div>
                    <div className="newsGrid">{deskStories.map((article, index) => <Reveal key={article._id || article.slug} delay={(index % 3) * 70}><BlogCard article={article} /></Reveal>)}</div>
                </section>}
            </section>
        </main>
    );
}
