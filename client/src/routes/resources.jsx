import { useQuery } from "@tanstack/react-query";
import BlogCard from "../components/blogCard/blogCard";
import { getNews } from "../libs/api/api.endpoints";
import "../libs/styles/resources.css";

export default function Resources() {
    const { data: articles = [], isLoading, isError } = useQuery({ queryKey: ["news"], queryFn: getNews });
    return (
        <main className="newsPage">
            <header className="newsMasthead">
                <p className="newsEyebrow">The ATP baseline</p>
                <h1>News from the court</h1>
                <p>Match reports, community stories and practical notes for players building their game.</p>
            </header>
            <section className="newsGrid" aria-live="polite">
                {isLoading && <p className="newsState">Fetching the latest from court…</p>}
                {isError && <p className="newsState">News could not be loaded. Please try again shortly.</p>}
                {!isLoading && !isError && articles.length === 0 && <p className="newsState">The first courtside report is being prepared.</p>}
                {articles.map((article, index) => <BlogCard key={article._id} article={article} featured={index === 0} />)}
            </section>
        </main>
    );
}
