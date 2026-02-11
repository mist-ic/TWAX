"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle2,
    SkipForward,
    Archive,
    Pencil,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/shared/score-badge";
import { TweetEditor } from "./tweet-editor";
import type { Article, ArticleAction } from "@/lib/types";

interface ArticleCardProps {
    article: Article;
    onAction: (action: ArticleAction, editedTweet?: string) => void;
    isActioning?: boolean;
    className?: string;
}

export function ArticleCard({
    article,
    onAction,
    isActioning = false,
    className,
}: ArticleCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTweet, setEditedTweet] = useState<string | null>(null);

    const displayTweet = editedTweet ?? article.generated_tweet ?? "";

    const handleApprove = () => {
        onAction("approve", editedTweet ?? undefined);
    };

    const handleSaveTweet = (tweet: string) => {
        setEditedTweet(tweet);
        setIsEditing(false);
    };

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm",
                "transition-all duration-300 hover:border-border/60 hover:bg-card/90",
                isActioning && "opacity-60 pointer-events-none",
                className
            )}
        >
            <CardContent className="p-5 space-y-4">
                {/* ── Header: Source + Score ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider font-heading text-muted-foreground border-border/40"
                        >
                            {article.source}
                        </Badge>
                        {article.hashtags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[11px] text-[var(--twax-info)] font-body"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <ScoreBadge score={article.relevance_score} />
                </div>

                {/* ── Title ── */}
                <div>
                    <h3 className="font-heading text-base font-bold leading-tight text-foreground">
                        {article.title}
                    </h3>
                    {article.url && (
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Read original
                        </a>
                    )}
                </div>

                {/* ── Summary ── */}
                {article.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed font-body">
                        {article.summary}
                    </p>
                )}

                <Separator className="bg-border/30" />

                {/* ── Tweet Section ── */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-heading">
                            Generated Tweet
                        </span>
                        {!isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-primary"
                            >
                                <Pencil className="h-3 w-3" />
                                Edit
                            </Button>
                        )}
                    </div>

                    {isEditing ? (
                        <TweetEditor
                            articleId={article.id}
                            title={article.title}
                            content={article.summary ?? ""}
                            initialTweet={displayTweet}
                            onSave={handleSaveTweet}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <div className="rounded-lg bg-background/50 border border-border/30 p-3">
                            <p className="text-sm font-body leading-relaxed text-foreground/90">
                                {displayTweet || (
                                    <span className="italic text-muted-foreground">
                                        No tweet generated yet
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Actions ── */}
                {!isEditing && (
                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            size="sm"
                            onClick={handleApprove}
                            disabled={isActioning}
                            className="flex-1 gap-1.5 bg-[var(--twax-success)]/15 text-[var(--twax-success)] border border-[var(--twax-success)]/25 hover:bg-[var(--twax-success)]/25 font-body"
                            variant="outline"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAction("defer")}
                            disabled={isActioning}
                            className="gap-1.5 text-muted-foreground hover:text-primary border-border/40 font-body"
                        >
                            <SkipForward className="h-4 w-4" />
                            Skip
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAction("reject")}
                            disabled={isActioning}
                            className="gap-1.5 text-muted-foreground hover:text-[var(--twax-danger)] border-border/40 font-body"
                        >
                            <Archive className="h-4 w-4" />
                            Archive
                        </Button>
                    </div>
                )}
            </CardContent>

            {/* Edited indicator */}
            {editedTweet && (
                <div className="absolute top-3 right-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
            )}
        </Card>
    );
}
