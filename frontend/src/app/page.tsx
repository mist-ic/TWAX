import { ModerationDashboard } from "@/components/ModerationDashboard";

export default function Home() {
    return (
        <div className="container">
            <header className="header">
                <h1>TWAX</h1>
                <p>Tech News Curator</p>
            </header>
            <ModerationDashboard />
        </div>
    );
}
