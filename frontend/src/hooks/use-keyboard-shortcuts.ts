"use client";

import { useEffect, useCallback } from "react";
import { usePendingArticles, useApproveArticle } from "@/lib/queries";
import { toast } from "sonner";

/**
 * Keyboard shortcuts for the dashboard:
 *   A = Approve top article
 *   S = Skip (defer) top article
 *   R = Reject (archive) top article
 *   E = Edit tweet (not handled here — triggers via ref)
 */
export function useKeyboardShortcuts() {
    const { data: articles } = usePendingArticles();
    const approveMutation = useApproveArticle();

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger if typing in an input or textarea
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            const topArticle = articles?.[0];
            if (!topArticle || approveMutation.isPending) return;

            switch (event.key.toLowerCase()) {
                case "a":
                    approveMutation.mutate(
                        { articleId: topArticle.id, action: "approve" },
                        { onSuccess: () => toast.success("Article approved! 🎉") }
                    );
                    break;
                case "s":
                    approveMutation.mutate(
                        { articleId: topArticle.id, action: "defer" },
                        {
                            onSuccess: () =>
                                toast.success("Article skipped — you can rescue it later"),
                        }
                    );
                    break;
                case "r":
                    approveMutation.mutate(
                        { articleId: topArticle.id, action: "reject" },
                        { onSuccess: () => toast.success("Article archived") }
                    );
                    break;
            }
        },
        [articles, approveMutation]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}
