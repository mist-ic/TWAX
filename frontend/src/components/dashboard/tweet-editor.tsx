"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegenerateTweet } from "@/lib/queries";

interface TweetEditorProps {
    articleId: string;
    title: string;
    content: string;
    initialTweet: string;
    onSave: (tweet: string) => void;
    onCancel: () => void;
    className?: string;
}

const MAX_CHARS = 280;

export function TweetEditor({
    articleId,
    title,
    content,
    initialTweet,
    onSave,
    onCancel,
    className,
}: TweetEditorProps) {
    const [tweet, setTweet] = useState(initialTweet);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const regenerate = useRegenerateTweet();

    const charCount = tweet.length;
    const charsRemaining = MAX_CHARS - charCount;
    const isOverLimit = charsRemaining < 0;

    const charColor =
        charsRemaining > 60
            ? "text-muted-foreground"
            : charsRemaining > 20
                ? "text-primary"
                : "text-[var(--twax-danger)]";

    // Focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(tweet.length, tweet.length);
    }, []);

    const handleRegenerate = () => {
        regenerate.mutate(
            { articleId, title, content },
            {
                onSuccess: (data) => {
                    setTweet(data.tweet);
                },
            }
        );
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={tweet}
                    onChange={(e) => setTweet(e.target.value)}
                    className={cn(
                        "min-h-[120px] resize-none bg-background/50 border-border/60 font-body text-sm leading-relaxed",
                        "focus:border-primary/40 focus:ring-primary/20",
                        isOverLimit && "border-[var(--twax-danger)]/60 focus:border-[var(--twax-danger)]/60"
                    )}
                    placeholder="Edit tweet text..."
                />

                {/* Character counter */}
                <div className="absolute bottom-2 right-3 flex items-center gap-2">
                    <span className={cn("text-xs font-heading tabular-nums", charColor)}>
                        {charsRemaining}
                    </span>
                    {/* Progress arc */}
                    <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                        <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-border/30"
                        />
                        <circle
                            cx="10"
                            cy="10"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${(charCount / MAX_CHARS) * 50.27} 50.27`}
                            className={cn(
                                charColor,
                                "transition-all duration-200"
                            )}
                        />
                    </svg>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRegenerate}
                    disabled={regenerate.isPending}
                    className="gap-1.5 text-muted-foreground hover:text-primary"
                >
                    <RefreshCw
                        className={cn(
                            "h-3.5 w-3.5",
                            regenerate.isPending && "animate-spin"
                        )}
                    />
                    Regenerate
                </Button>

                <div className="flex-1" />

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancel}
                    className="gap-1.5 text-muted-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={() => onSave(tweet)}
                    disabled={isOverLimit || tweet.trim().length === 0}
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Check className="h-3.5 w-3.5" />
                    Save
                </Button>
            </div>
        </div>
    );
}
