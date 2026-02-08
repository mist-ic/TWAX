"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { ArticleCard } from "./ArticleCard";

// Mock data for development
const mockArticles = [
    {
        id: "1",
        title: "OpenAI Releases GPT-5 with Native Multimodal Reasoning",
        source: "TechCrunch",
        summary: "OpenAI announces GPT-5 with breakthrough multimodal capabilities, outperforming previous models in code, math, and reasoning benchmarks.",
        generatedTweet: "🚀 OpenAI just dropped GPT-5 with native multimodal reasoning. Early benchmarks show 40% improvement in code generation and mathematical reasoning over GPT-4o.",
        hashtags: ["#AI", "#OpenAI"],
        score: 9,
        url: "https://techcrunch.com/openai-gpt5",
    },
    {
        id: "2",
        title: "Google DeepMind Achieves AGI Milestone with Gemini Ultra 2",
        source: "Ars Technica",
        summary: "DeepMind researchers claim Gemini Ultra 2 passes key AGI benchmarks, sparking debate in AI research community.",
        generatedTweet: "Google DeepMind claims Gemini Ultra 2 has reached AGI-level performance on key benchmarks. The AI community is divided on whether this truly counts as AGI.",
        hashtags: ["#AGI", "#Google"],
        score: 8,
        url: "https://arstechnica.com/deepmind-agi",
    },
    {
        id: "3",
        title: "Anthropic Open Sources Claude's Constitutional AI Training",
        source: "The Verge",
        summary: "Anthropic releases the full training methodology and code for Constitutional AI, enabling other labs to implement safer AI alignment.",
        generatedTweet: "Anthropic just open-sourced Constitutional AI! Other labs can now implement the safety techniques behind Claude. This is huge for AI alignment research.",
        hashtags: ["#Anthropic", "#AISafety"],
        score: 7,
    },
];

export type Article = typeof mockArticles[0];
export type SwipeAction = "approve" | "reject" | "defer";

interface Props {
    articles?: Article[];
    onSwipe?: (articleId: string, action: SwipeAction) => void;
}

export function ModerationDashboard({ articles = mockArticles, onSwipe }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState({ approved: 0, rejected: 0, deferred: 0 });
    const controls = useAnimation();

    const currentArticle = articles[currentIndex];
    const remaining = articles.length - currentIndex;

    const handleSwipe = useCallback(
        async (action: SwipeAction) => {
            if (!currentArticle) return;

            // Animate card off screen
            const direction = action === "approve" ? 1 : action === "reject" ? -1 : 0;
            const y = action === "defer" ? -500 : 0;
            const x = direction * 500;

            await controls.start({
                x,
                y,
                opacity: 0,
                transition: { duration: 0.3 },
            });

            // Update stats
            setStats((prev) => ({
                ...prev,
                [action === "approve" ? "approved" : action === "reject" ? "rejected" : "deferred"]:
                    prev[action === "approve" ? "approved" : action === "reject" ? "rejected" : "deferred"] + 1,
            }));

            // Callback
            onSwipe?.(currentArticle.id, action);

            // Move to next card
            setCurrentIndex((prev) => prev + 1);

            // Reset card position for next card
            controls.set({ x: 0, y: 0, opacity: 1 });
        },
        [currentArticle, controls, onSwipe]
    );

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "a" || e.key === "A" || e.key === "ArrowRight") {
                handleSwipe("approve");
            } else if (e.key === "r" || e.key === "R" || e.key === "ArrowLeft") {
                handleSwipe("reject");
            } else if (e.key === "s" || e.key === "S" || e.key === "ArrowUp") {
                handleSwipe("defer");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSwipe]);

    // Drag handling
    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            handleSwipe("approve");
        } else if (info.offset.x < -threshold) {
            handleSwipe("reject");
        } else if (info.offset.y < -threshold) {
            handleSwipe("defer");
        } else {
            controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300 } });
        }
    };

    if (!currentArticle) {
        return (
            <div className="empty-state">
                <h2>All caught up! 🎉</h2>
                <p>No more articles to review.</p>
                <div className="stats" style={{ marginTop: "2rem" }}>
                    <div className="stat">
                        <div className="stat-value" style={{ color: "var(--accent-approve)" }}>
                            {stats.approved}
                        </div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value" style={{ color: "var(--accent-reject)" }}>
                            {stats.rejected}
                        </div>
                        <div className="stat-label">Rejected</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value" style={{ color: "var(--accent-defer)" }}>
                            {stats.deferred}
                        </div>
                        <div className="stat-label">Deferred</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="stats">
                <div className="stat">
                    <div className="stat-value">{remaining}</div>
                    <div className="stat-label">Remaining</div>
                </div>
                <div className="stat">
                    <div className="stat-value" style={{ color: "var(--accent-approve)" }}>
                        {stats.approved}
                    </div>
                    <div className="stat-label">Approved</div>
                </div>
            </div>

            <div className="card-stack">
                <motion.div
                    className="article-card"
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    whileDrag={{ scale: 1.02 }}
                >
                    <ArticleCard article={currentArticle} />
                </motion.div>
            </div>

            <div className="actions">
                <button className="action-btn btn-reject" onClick={() => handleSwipe("reject")}>
                    ✕
                </button>
                <button className="action-btn btn-defer" onClick={() => handleSwipe("defer")}>
                    ↑
                </button>
                <button className="action-btn btn-approve" onClick={() => handleSwipe("approve")}>
                    ✓
                </button>
            </div>

            <div className="keyboard-hints">
                <span>
                    <span className="key">R</span> Reject
                </span>
                <span>
                    <span className="key">S</span> Skip
                </span>
                <span>
                    <span className="key">A</span> Approve
                </span>
            </div>
        </>
    );
}
