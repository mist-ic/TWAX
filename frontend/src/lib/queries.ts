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
        queryFn: () => fetchArticles(status, limit),
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
        queryFn: checkHealth,
        refetchInterval: 60 * 1000, // Poll every 60s
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
        }) => approveArticle(articleId, action, editedTweet),

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
                queryClient.setQueryData<Article[]>(
                    queryKeys.articlesByStatus("pending"),
                    previousPending.filter((a) => a.id !== articleId)
                );
            }

            return { previousPending };
        },

        onError: (_err, _vars, context) => {
            // Roll back on error
            if (context?.previousPending) {
                queryClient.setQueryData(
                    queryKeys.articlesByStatus("pending"),
                    context.previousPending
                );
            }
        },

        onSettled: () => {
            // Refetch to sync with server
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
        }) => regenerateTweet(articleId, title, content, feedback),
    });
}
