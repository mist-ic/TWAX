"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ExternalLink,
    Filter,
    CheckCircle2,
    XCircle,
    SkipForward,
    Clock,
} from "lucide-react";
import { useArticles } from "@/lib/queries";
import { ScoreBadge } from "@/components/shared/score-badge";
import type { ArticleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS: { value: ArticleStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Archived" },
    { value: "deferred", label: "Deferred" },
    { value: "pending", label: "Pending" },
];

const STATUS_ICON: Record<ArticleStatus, typeof CheckCircle2> = {
    approved: CheckCircle2,
    rejected: XCircle,
    deferred: SkipForward,
    pending: Clock,
};

const STATUS_COLOR: Record<ArticleStatus, string> = {
    approved: "text-[var(--twax-success)]",
    rejected: "text-[var(--twax-danger)]",
    deferred: "text-primary",
    pending: "text-muted-foreground",
};

export default function HistoryPage() {
    const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">(
        "all"
    );

    const { data: articles, isLoading } = useArticles(
        statusFilter === "all" ? undefined : statusFilter,
        50
    );

    const items = articles ?? [];

    // Group by date
    const grouped = items.reduce<Record<string, typeof items>>((acc, article) => {
        const date = new Date(article.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(article);
        return acc;
    }, {});

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-dvh overflow-hidden">
                <Header />

                <main className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 sm:py-6 space-y-5 sm:space-y-6">
                            {/* Page Header */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h1 className="font-heading text-lg sm:text-xl font-bold tracking-wide">
                                        HISTORY
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-body mt-0.5 sm:mt-1">
                                        All processed articles
                                    </p>
                                </div>

                                {/* Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 font-body border-border/40 shrink-0"
                                        >
                                            <Filter className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">
                                                {STATUS_OPTIONS.find((o) => o.value === statusFilter)
                                                    ?.label ?? "All"}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-card border-border/40"
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setStatusFilter(opt.value)}
                                                className={cn(
                                                    "font-body text-sm",
                                                    statusFilter === opt.value && "text-primary"
                                                )}
                                            >
                                                {opt.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Loading */}
                            {isLoading && (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-24 w-full rounded-xl bg-card/50"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Empty */}
                            {!isLoading && items.length === 0 && (
                                <div className="rounded-xl border border-border/30 bg-card/50 p-12 text-center">
                                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <h3 className="font-heading text-lg font-bold">
                                        No articles found
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-body mt-1">
                                        {statusFilter !== "all"
                                            ? `No ${statusFilter} articles yet.`
                                            : "No articles have been processed yet."}
                                    </p>
                                </div>
                            )}

                            {/* Grouped items */}
                            <AnimatePresence mode="wait">
                                {Object.entries(grouped).map(([date, dateArticles]) => (
                                    <motion.div
                                        key={date}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3"
                                    >
                                        <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground/60 pt-2">
                                            {date}
                                        </h2>

                                        {dateArticles.map((article) => {
                                            const StatusIcon = STATUS_ICON[article.status];
                                            return (
                                                <Card
                                                    key={article.id}
                                                    className="border-border/30 bg-card/50 hover:bg-card/70 transition-colors overflow-hidden"
                                                >
                                                    <CardContent className="p-3 sm:p-4 overflow-hidden">
                                                        <div className="flex items-start gap-2.5 sm:gap-3">
                                                            {/* Status icon */}
                                                            <div className="pt-0.5 shrink-0">
                                                                <StatusIcon
                                                                    className={cn(
                                                                        "h-4 w-4 sm:h-5 sm:w-5",
                                                                        STATUS_COLOR[article.status]
                                                                    )}
                                                                />
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                                                                {/* Title & Score */}
                                                                <div className="flex items-start gap-2">
                                                                    <h3 className="font-heading text-xs sm:text-sm font-bold leading-snug line-clamp-2 flex-1 min-w-0">
                                                                        {article.title}
                                                                    </h3>
                                                                    <ScoreBadge score={article.relevance_score} className="shrink-0 mt-0.5" />
                                                                </div>

                                                                {/* Source + Tags */}
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[9px] sm:text-[10px] uppercase tracking-wider font-heading text-muted-foreground border-border/30"
                                                                    >
                                                                        {article.source}
                                                                    </Badge>
                                                                    {article.hashtags.slice(0, 2).map((tag) => (
                                                                        <span
                                                                            key={tag}
                                                                            className="text-[10px] sm:text-[11px] text-[var(--twax-info)] font-body hidden sm:inline"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>

                                                                {/* Tweet preview */}
                                                                {article.generated_tweet && (
                                                                    <p className="text-xs text-muted-foreground font-body leading-relaxed mt-1 line-clamp-2 break-words">
                                                                        {article.generated_tweet}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* External link — hidden on mobile */}
                                                            <a
                                                                href={article.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-muted-foreground hover:text-primary transition-colors shrink-0 hidden sm:block"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
