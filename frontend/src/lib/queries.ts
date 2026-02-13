/* ═══════════════════════════════════════
   TWAX TanStack Query hooks — server state management
   ═══════════════════════════════════════ */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchArticles,
    approveArticle,
    regenerateTweet,
    checkHealth,
} from "./api";
import { log } from "./logger";
import type { Article, ArticleAction, ArticleStatus } from "./types";

/* ─── Query Keys ─── */

export const queryKeys = {
    articles: ["articles"] as const,
    articlesByStatus: (status: string) => ["articles", status] as const,
    health: ["health"] as const,
};

/* ─── Queries ─── */

export function useArticles(status?: ArticleStatus, limit: number = 20) {
    return useQuery({
        queryKey: status
            ? queryKeys.articlesByStatus(status)
            : queryKeys.articles,
        queryFn: async () => {
            const key = status ? `articles/${status}` : "articles";
            log.query("QUERY", `${key} → fetching (limit=${limit})`);
            const data = await fetchArticles(status, limit);
            log.query("QUERY", `${key} → success (${data.length} items)`, {
                ids: data.slice(0, 3).map(a => a.id),
                titles: data.slice(0, 3).map(a => a.title.slice(0, 50)),
            });
            return data;
        },
        staleTime: 30 * 1000,
    });
}

export function usePendingArticles(limit: number = 20) {
    return useArticles("pending", limit);
}

export function useApprovedArticles(limit: number = 20) {
    return useArticles("approved", limit);
}

export function useHealth() {
    return useQuery({
        queryKey: queryKeys.health,
        queryFn: async () => {
            log.query("QUERY", "health → fetching");
            const data = await checkHealth();
            log.query("QUERY", `health → ${data.status} (${data.service})`);
            return data;
        },
        refetchInterval: 60 * 1000,
        staleTime: 30 * 1000,
        retry: 1,
    });
}

/* ─── Mutations ─── */

export function useApproveArticle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            articleId,
            action,
            editedTweet,
        }: {
            articleId: string;
            action: ArticleAction;
            editedTweet?: string;
        }) => {
            log.mutation("MUTATION", `${action} ${articleId} → sending...`);
            return approveArticle(articleId, action, editedTweet);
        },

        // Optimistic update — immediately move article out of pending
        onMutate: async ({ articleId, action }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.articles });

            // Snapshot previous value
            const previousPending = queryClient.getQueryData<Article[]>(
                queryKeys.articlesByStatus("pending")
            );

            // Optimistically remove from pending
            if (previousPending) {
                const newPending = previousPending.filter((a) => a.id !== articleId);
                queryClient.setQueryData<Article[]>(
                    queryKeys.articlesByStatus("pending"),
                    newPending
                );
                log.optimistic(
                    "OPTIMISTIC",
                    `${action} ${articleId} → removed from pending (${previousPending.length}→${newPending.length} items)`
                );
            }

            return { previousPending };
        },

        onError: (err, vars, context) => {
            log.error("MUTATION", `${vars.action} ${vars.articleId} → FAILED`, err);
            // Roll back on error
            if (context?.previousPending) {
                queryClient.setQueryData(
                    queryKeys.articlesByStatus("pending"),
                    context.previousPending
                );
                log.optimistic("OPTIMISTIC", `Rolled back pending cache (restored ${context.previousPending.length} items)`);
            }
        },

        onSuccess: (_data, vars) => {
            log.mutation("MUTATION", `${vars.action} ${vars.articleId} → success ✅`);
        },

        onSettled: () => {
            // Refetch to sync with server
            log.query("QUERY", "articles → invalidating all caches");
            queryClient.invalidateQueries({ queryKey: queryKeys.articles });
        },
    });
}

export function useRegenerateTweet() {
    return useMutation({
        mutationFn: ({
            articleId,
            title,
            content,
            feedback,
        }: {
            articleId: string;
            title: string;
            content: string;
            feedback?: string;
        }) => {
            log.mutation("MUTATION", `regenerate tweet for ${articleId} → sending...`);
            return regenerateTweet(articleId, title, content, feedback);
        },
        onSuccess: (_data, vars) => {
            log.mutation("MUTATION", `regenerate tweet for ${vars.articleId} → success ✅`, {
                tweet: _data.tweet.slice(0, 60) + "...",
                hashtags: _data.hashtags,
            });
        },
        onError: (err, vars) => {
            log.error("MUTATION", `regenerate tweet for ${vars.articleId} → FAILED`, err);
        },
    });
}

/* ─── Fetch Articles ─── */

export function useFetchArticles() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { fetchNewArticles } = await import("./api");
            log.mutation("MUTATION", "fetch articles → sending...");
            return fetchNewArticles();
        },
        onSuccess: (data) => {
            log.mutation("MUTATION", `fetch articles → ${data.new} new, ${data.duplicates} dups ✅`);
            qc.invalidateQueries({ queryKey: ["articles"] });
        },
        onError: (err) => {
            log.error("MUTATION", "fetch articles → FAILED", err);
        },
    });
}
