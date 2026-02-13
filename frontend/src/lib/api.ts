/* ═══════════════════════════════════════
   TWAX API Client — typed fetch functions for all backend endpoints
   Supports both live backend and mock data via NEXT_PUBLIC_USE_MOCK env var
   ═══════════════════════════════════════ */

import type {
    Article,
    ArticleAction,
    ApproveResponse,
    TweetOutput,
    HealthResponse,
} from "./types";
import { log } from "./logger";

const API_BASE =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/* ─── Helpers ─── */

async function apiFetch<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const method = options?.method || "GET";
    const url = `${API_BASE}${path}`;
    const start = performance.now();

    log.api("API", `${method} ${path} → sending...`);

    try {
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json", ...options?.headers },
            ...options,
        });

        const elapsed = Math.round(performance.now() - start);

        if (!res.ok) {
            const error = await res.text().catch(() => "Unknown error");
            log.error("API", `${method} ${path} → ${res.status} (${elapsed}ms)`, error);
            throw new Error(`API ${res.status}: ${error}`);
        }

        const data = await res.json() as T;
        const itemCount = Array.isArray(data) ? `${data.length} items` : "object";
        log.api("API", `${method} ${path} → ${res.status} (${elapsed}ms, ${itemCount})`);

        return data;
    } catch (err) {
        const elapsed = Math.round(performance.now() - start);
        if (!(err instanceof Error && err.message.startsWith("API "))) {
            log.error("API", `${method} ${path} → NETWORK ERROR (${elapsed}ms)`, err);
        }
        throw err;
    }
}

/* ─── Mock Data ─── */

const MOCK_ARTICLES: Article[] = [
    {
        id: "mock-1",
        title: "OpenAI Releases GPT-5 with Native Multimodal Reasoning",
        url: "https://techcrunch.com/openai-gpt5",
        source: "TechCrunch",
        relevance_score: 9,
        newsworthiness_score: 9,
        summary:
            "OpenAI announces GPT-5 with breakthrough multimodal capabilities, outperforming previous models in code, math, and reasoning benchmarks.",
        generated_tweet:
            "🚀 OpenAI just dropped GPT-5 with native multimodal reasoning. Early benchmarks show 40% improvement in code generation and mathematical reasoning over GPT-4o.",
        hashtags: ["#AI", "#OpenAI"],
        status: "pending",
        created_at: new Date().toISOString(),
    },
    {
        id: "mock-2",
        title: "Google DeepMind Achieves AGI Milestone with Gemini Ultra 2",
        url: "https://arstechnica.com/deepmind-agi",
        source: "Ars Technica",
        relevance_score: 8,
        newsworthiness_score: 8,
        summary:
            "DeepMind researchers claim Gemini Ultra 2 passes key AGI benchmarks, sparking debate in AI research community.",
        generated_tweet:
            "Google DeepMind claims Gemini Ultra 2 has reached AGI-level performance on key benchmarks. The AI community is divided — is this truly AGI?",
        hashtags: ["#AGI", "#Google"],
        status: "pending",
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: "mock-3",
        title: "Anthropic Open Sources Claude's Constitutional AI Training",
        url: "https://theverge.com/anthropic-constitutional-ai",
        source: "The Verge",
        relevance_score: 7,
        newsworthiness_score: 8,
        summary:
            "Anthropic releases the full training methodology and code for Constitutional AI, enabling other labs to implement safer AI alignment.",
        generated_tweet:
            "Anthropic just open-sourced Constitutional AI! Other labs can now implement the safety techniques behind Claude. Huge for AI alignment research.",
        hashtags: ["#Anthropic", "#AISafety"],
        status: "pending",
        created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: "mock-4",
        title: "Meta Releases Llama 4 with 1T Parameters",
        url: "https://meta.ai/llama4",
        source: "Wired",
        relevance_score: 8,
        newsworthiness_score: 7,
        summary:
            "Meta's latest open-source LLM Llama 4 features 1 trillion parameters with mixture-of-experts architecture, available for commercial use.",
        generated_tweet:
            "Meta drops Llama 4 — 1 TRILLION parameters, fully open-source with MoE architecture. Running on a single H100 node with quantization. The open-source AI race is 🔥",
        hashtags: ["#Llama4", "#OpenSource"],
        status: "pending",
        created_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
        id: "mock-5",
        title: "NVIDIA Announces Blackwell Ultra GPUs for AI Training",
        url: "https://nvidia.com/blackwell-ultra",
        source: "TechCrunch",
        relevance_score: 7,
        newsworthiness_score: 6,
        summary:
            "NVIDIA unveils Blackwell Ultra, promising 3x performance per watt for AI training workloads compared to H100.",
        generated_tweet:
            "NVIDIA's Blackwell Ultra GPU is here — 3x performance/watt over H100 for AI training. Jensen Huang says it'll make $1T AI models economically viable.",
        hashtags: ["#NVIDIA", "#AIHardware"],
        status: "approved",
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "mock-6",
        title: "Hugging Face Launches Free GPU Cloud for Researchers",
        url: "https://huggingface.co/free-gpu",
        source: "Hacker News",
        relevance_score: 6,
        newsworthiness_score: 7,
        summary:
            "Hugging Face partners with cloud providers to offer free GPU access for academic AI researchers, with 100 H100 hours per month.",
        generated_tweet:
            "🎓 Hugging Face now offers FREE H100 GPU access for researchers — 100 hours/month. No more GPU poverty for academic AI research!",
        hashtags: ["#HuggingFace", "#AIResearch"],
        status: "rejected",
        created_at: new Date(Date.now() - 172800000).toISOString(),
    },
];

/* ─── API Functions ─── */

export async function fetchArticles(
    status?: string,
    limit: number = 20
): Promise<Article[]> {
    if (USE_MOCK) {
        log.api("API", `fetchArticles(status=${status ?? "all"}) → MOCK (${MOCK_ARTICLES.length} total)`);
        const filtered = status
            ? MOCK_ARTICLES.filter((a) => a.status === status)
            : MOCK_ARTICLES;
        return filtered.slice(0, limit);
    }

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("limit", String(limit));

    return apiFetch<Article[]>(`/api/articles?${params}`);
}

export async function approveArticle(
    articleId: string,
    action: ArticleAction,
    editedTweet?: string
): Promise<ApproveResponse> {
    if (USE_MOCK) {
        log.api("API", `approveArticle(${articleId}, ${action}) → MOCK`);
        const article = MOCK_ARTICLES.find((a) => a.id === articleId);
        if (article) {
            article.status =
                action === "approve"
                    ? "approved"
                    : action === "reject"
                        ? "rejected"
                        : "deferred";
            if (editedTweet) article.generated_tweet = editedTweet;
        }
        return { status: "updated", article_id: articleId, action };
    }

    const params = new URLSearchParams({ action });
    if (editedTweet) params.set("edited_tweet", editedTweet);

    return apiFetch<ApproveResponse>(
        `/api/articles/${articleId}/approve?${params}`,
        { method: "POST" }
    );
}

export async function generateTweet(
    articleId: string,
    title: string,
    content: string
): Promise<TweetOutput> {
    if (USE_MOCK) {
        log.api("API", `generateTweet(${articleId}) → MOCK`);
        return {
            tweet: `✨ ${title.slice(0, 200)} — fascinating implications for the tech industry.`,
            hashtags: ["#AI", "#Tech"],
            score: 8,
        };
    }

    const params = new URLSearchParams({
        article_id: articleId,
        title,
        content,
    });

    return apiFetch<TweetOutput>(`/api/generate-tweet?${params}`, {
        method: "POST",
    });
}

export async function regenerateTweet(
    articleId: string,
    title: string,
    content: string,
    feedback?: string
): Promise<TweetOutput> {
    if (USE_MOCK) {
        log.api("API", `regenerateTweet(${articleId}) → MOCK`);
        return {
            tweet: `🔥 Breaking: ${title.slice(0, 180)} — this changes everything.`,
            hashtags: ["#TechNews"],
            score: 7,
        };
    }

    const params = new URLSearchParams({
        article_id: articleId,
        title,
        content,
    });
    if (feedback) params.set("feedback", feedback);

    return apiFetch<TweetOutput>(`/api/regenerate-tweet?${params}`, {
        method: "POST",
    });
}

export async function checkHealth(): Promise<HealthResponse> {
    if (USE_MOCK) {
        log.api("API", "checkHealth() → MOCK (healthy)");
        return { status: "healthy", service: "twax-backend (mock)" };
    }

    return apiFetch<HealthResponse>("/health");
}

/* ─── Fetch Pipeline ─── */

export interface FetchResult {
    fetched: number;
    new: number;
    duplicates: number;
    errors: number;
    articles: Array<{
        id: string;
        title: string;
        source: string;
        relevance: number | null;
        newsworthiness: number | null;
        tweet: string | null;
        hashtags: string[];
    }>;
}

export async function fetchNewArticles(): Promise<FetchResult> {
    return apiFetch<FetchResult>("/api/fetch", { method: "POST" });
}

export async function deleteAllArticles(): Promise<{ deleted: number }> {
    return apiFetch<{ deleted: number }>("/api/articles", { method: "DELETE" });
}
