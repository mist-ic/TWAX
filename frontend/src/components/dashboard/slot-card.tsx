"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/components/shared/status-indicator";
import type { TimeSlot } from "@/lib/types";

interface SlotCardProps {
    slot: TimeSlot;
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function SlotCard({
    slot,
    isSelected = false,
    onClick,
    className,
}: SlotCardProps) {
    const isCurrent = slot.status === "current";
    const isPosted = slot.status === "posted";

    return (
        <Card
            className={cn(
                "cursor-pointer border-border/30 bg-card/50 transition-all duration-200",
                "hover:border-border/50 hover:bg-card/70",
                isSelected && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                isCurrent && "animate-pulse-glow border-primary/30",
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-3 flex items-center gap-3">
                {/* Time */}
                <div className="flex flex-col items-center min-w-[50px]">
                    <span className="font-heading text-xs font-bold text-foreground">
                        {slot.label}
                    </span>
                </div>

                {/* Status indicator */}
                <StatusIndicator variant={slot.status} />

                {/* Preview */}
                <div className="flex-1 min-w-0">
                    {isPosted && slot.article ? (
                        <p className="text-xs text-muted-foreground truncate font-body">
                            {slot.article.generated_tweet ?? slot.article.title}
                        </p>
                    ) : isCurrent ? (
                        <p className="text-xs text-primary font-body font-medium">
                            Ready for selection
                        </p>
                    ) : slot.status === "skipped" ? (
                        <p className="text-xs text-muted-foreground/50 font-body italic">
                            Skipped
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground/40 font-body">
                            Upcoming
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
