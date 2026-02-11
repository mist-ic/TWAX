/* ═══════════════════════════════════════
   TWAX TypeScript types — matches backend Pydantic schemas
   ═══════════════════════════════════════ */

export type ArticleStatus = "pending" | "approved" | "rejected" | "deferred";

export interface Article {
    id: string;
    title: string;
    url: string;
    source: string;
    relevance_score: number | null;
    newsworthiness_score: number | null;
    summary: string | null;
    generated_tweet: string | null;
    hashtags: string[];
    status: ArticleStatus;
    created_at: string;
}

export interface TweetOutput {
    tweet: string;
    hashtags: string[];
    score: number;
}

export interface HealthResponse {
    status: "healthy" | "unhealthy";
    service: string;
}

export interface ApproveResponse {
    status: string;
    article_id: string;
    action: string;
}

/** Actions the user can take on an article */
export type ArticleAction = "approve" | "reject" | "defer";

/** Time slot for the Day Planner */
export interface TimeSlot {
    id: string;
    time: string;          // "09:00", "10:30", etc.
    label: string;         // "9:00 AM"
    status: "posted" | "current" | "upcoming" | "skipped" | "empty";
    article?: Article;     // Assigned article (if posted/approved)
}

/** Default posting schedule — 6 slots per day */
export const DEFAULT_TIME_SLOTS: Omit<TimeSlot, "status" | "article">[] = [
    { id: "slot-1", time: "09:00", label: "9:00 AM" },
    { id: "slot-2", time: "10:30", label: "10:30 AM" },
    { id: "slot-3", time: "12:00", label: "12:00 PM" },
    { id: "slot-4", time: "14:00", label: "2:00 PM" },
    { id: "slot-5", time: "15:30", label: "3:30 PM" },
    { id: "slot-6", time: "17:00", label: "5:00 PM" },
];
