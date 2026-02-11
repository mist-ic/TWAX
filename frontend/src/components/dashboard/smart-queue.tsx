"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePendingArticles, useApproveArticle } from "@/lib/queries";
import { ArticleCard } from "./article-card";
import type { ArticleAction } from "@/lib/types";
import { toast } from "sonner";

interface SmartQueueProps {
    className?: string;
}

const ACTION_MESSAGES: Record<ArticleAction, string> = {
    approve: "Article approved! 🎉",
    reject: "Article archived",
    defer: "Article skipped — you can rescue it later",
};

export function SmartQueue({ className }: SmartQueueProps) {
    const { data: articles, isLoading, error } = usePendingArticles();
    const approveMutation = useApproveArticle();

    const handleAction = (
        articleId: string,
        action: ArticleAction,
        editedTweet?: string
    ) => {
        approveMutation.mutate(
            { articleId, action, editedTweet },
            {
                onSuccess: () => {
                    toast.success(ACTION_MESSAGES[action]);
                },
                onError: (err) => {
                    toast.error(`Failed: ${err.message}`);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className={cn("space-y-4", className)}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-heading text-lg font-bold tracking-wide">
                        SMART QUEUE
                    </h2>
                </div>
                {[1, 2, 3].map((i) => (
                    <Skeleton
                        key={i}
                        className="h-64 w-full rounded-xl bg-card/50"
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("space-y-4", className)}>
                <h2 className="font-heading text-lg font-bold tracking-wide">
                    SMART QUEUE
                </h2>
                <div className="rounded-xl border border-[var(--twax-danger)]/30 bg-[var(--twax-danger)]/5 p-6 text-center">
                    <p className="text-sm text-[var(--twax-danger)] font-body">
                        Failed to load articles. Is the backend running?
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-body">
                        {error.message}
                    </p>
                </div>
            </div>
        );
    }

    const pending = articles ?? [];

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold tracking-wide">
                    SMART QUEUE
                </h2>
                <span className="text-xs text-muted-foreground font-body tabular-nums">
                    {pending.length} article{pending.length !== 1 ? "s" : ""} pending
                </span>
            </div>

            {/* Articles */}
            <AnimatePresence mode="popLayout">
                {pending.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-border/30 bg-card/50 p-12 text-center"
                    >
                        <PartyPopper className="h-10 w-10 text-primary mx-auto mb-3" />
                        <h3 className="font-heading text-lg font-bold">All caught up!</h3>
                        <p className="text-sm text-muted-foreground font-body mt-1">
                            No pending articles to review. Check back later.
                        </p>
                    </motion.div>
                ) : (
                    pending.map((article, index) => (
                        <motion.div
                            key={article.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: index * 0.08 },
                            }}
                            exit={{
                                opacity: 0,
                                x: -100,
                                transition: { duration: 0.25 },
                            }}
                        >
                            <ArticleCard
                                article={article}
                                onAction={(action, editedTweet) =>
                                    handleAction(article.id, action, editedTweet)
                                }
                                isActioning={
                                    approveMutation.isPending &&
                                    approveMutation.variables?.articleId === article.id
                                }
                            />
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
}
