"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, SkipForward, Clock, Circle, Archive } from "lucide-react";

type StatusVariant = "posted" | "current" | "upcoming" | "skipped" | "empty";

interface StatusIndicatorProps {
    variant: StatusVariant;
    className?: string;
    showLabel?: boolean;
}

const STATUS_CONFIG: Record<
    StatusVariant,
    { icon: typeof CheckCircle2; label: string; colorClass: string }
> = {
    posted: {
        icon: CheckCircle2,
        label: "Posted",
        colorClass: "text-[var(--twax-success)]",
    },
    current: {
        icon: Circle,
        label: "Current",
        colorClass: "text-primary animate-pulse-glow",
    },
    upcoming: {
        icon: Clock,
        label: "Upcoming",
        colorClass: "text-muted-foreground",
    },
    skipped: {
        icon: SkipForward,
        label: "Skipped",
        colorClass: "text-muted-foreground/50",
    },
    empty: {
        icon: Archive,
        label: "Empty",
        colorClass: "text-muted-foreground/30",
    },
};

export function StatusIndicator({
    variant,
    className,
    showLabel = false,
}: StatusIndicatorProps) {
    const config = STATUS_CONFIG[variant];
    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <Icon className={cn("h-4 w-4", config.colorClass)} />
            {showLabel && (
                <span
                    className={cn(
                        "text-xs font-body",
                        config.colorClass
                    )}
                >
                    {config.label}
                </span>
            )}
        </div>
    );
}
