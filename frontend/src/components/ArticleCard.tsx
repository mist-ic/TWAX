import { Article } from "./ModerationDashboard";

interface Props {
    article: Article;
}

export function ArticleCard({ article }: Props) {
    return (
        <>
            <div className="card-source">
                <span className="source-name">{article.source}</span>
                <span className="score-badge">{article.score}/10</span>
            </div>

            <h2 className="card-title">{article.title}</h2>

            <p className="card-summary">{article.summary}</p>

            <div className="card-tweet">
                <div className="card-tweet-label">Generated Tweet</div>
                <p className="card-tweet-text">{article.generatedTweet}</p>
            </div>

            <div className="card-hashtags">
                {article.hashtags.map((tag) => (
                    <span key={tag} className="hashtag">
                        {tag}
                    </span>
                ))}
            </div>
        </>
    );
}
