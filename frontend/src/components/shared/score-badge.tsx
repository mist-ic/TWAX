"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
    score: number | null;
    className?: string;
    size?: "sm" | "md";
}

export function ScoreBadge({ score, className, size = "sm" }: ScoreBadgeProps) {
    if (score === null || score === undefined) return null;

    const color =
        score >= 8
            ? "bg-[var(--twax-success)]/15 text-[var(--twax-success)] border-[var(--twax-success)]/25"
            : score >= 5
                ? "bg-primary/15 text-primary border-primary/25"
                : "bg-[var(--twax-danger)]/15 text-[var(--twax-danger)] border-[var(--twax-danger)]/25";

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-heading font-bold border tabular-nums",
                color,
                size === "sm" ? "text-[11px] px-1.5 py-0" : "text-xs px-2 py-0.5",
                className
            )}
        >
            {score}/10
        </Badge>
    );
}
