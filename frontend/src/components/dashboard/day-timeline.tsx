"use client";

import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SlotCard } from "./slot-card";
import { DEFAULT_TIME_SLOTS, type TimeSlot } from "@/lib/types";
import { useApprovedArticles } from "@/lib/queries";

interface DayTimelineProps {
    selectedSlotId?: string;
    onSlotSelect?: (slotId: string) => void;
    className?: string;
}

function getCurrentSlotId(): string {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = DEFAULT_TIME_SLOTS.length - 1; i >= 0; i--) {
        const [h, m] = DEFAULT_TIME_SLOTS[i].time.split(":").map(Number);
        if (currentMinutes >= h * 60 + m) {
            return DEFAULT_TIME_SLOTS[i].id;
        }
    }

    return DEFAULT_TIME_SLOTS[0].id;
}

export function DayTimeline({
    selectedSlotId,
    onSlotSelect,
    className,
}: DayTimelineProps) {
    const { data: approved } = useApprovedArticles();
    const [selected, setSelected] = useState(
        selectedSlotId ?? getCurrentSlotId()
    );

    const currentSlotId = useMemo(() => getCurrentSlotId(), []);

    const slots: TimeSlot[] = useMemo(() => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        return DEFAULT_TIME_SLOTS.map((s, index) => {
            const [h, m] = s.time.split(":").map(Number);
            const slotMinutes = h * 60 + m;
            const isCurrent = s.id === currentSlotId;
            const isPast = slotMinutes < currentMinutes && !isCurrent;

            // Check if we have an approved article for this slot
            const assignedArticle = approved?.[index];

            let status: TimeSlot["status"];
            if (assignedArticle) {
                status = "posted";
            } else if (isCurrent) {
                status = "current";
            } else if (isPast) {
                status = "skipped";
            } else {
                status = "upcoming";
            }

            return {
                ...s,
                status,
                article: assignedArticle,
            };
        });
    }, [approved, currentSlotId]);

    const handleSelect = (slotId: string) => {
        setSelected(slotId);
        onSlotSelect?.(slotId);
    };

    // Stats
    const postedCount = slots.filter((s) => s.status === "posted").length;
    const totalSlots = slots.length;

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/30">
                <h2 className="font-heading text-sm font-bold tracking-wide">
                    TODAY&apos;S SCHEDULE
                </h2>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                    {postedCount}/{totalSlots} slots filled
                </p>
            </div>

            {/* Timeline */}
            <ScrollArea className="flex-1 px-3 py-3">
                <div className="relative space-y-2">
                    {/* Vertical line */}
                    <div className="absolute left-[37px] top-4 bottom-4 w-px bg-border/30" />

                    {slots.map((slot) => (
                        <div key={slot.id} className="relative">
                            {/* Timeline dot */}
                            <div
                                className={cn(
                                    "absolute left-[34px] top-[18px] z-10 h-2 w-2 rounded-full border-2",
                                    slot.status === "posted" &&
                                    "bg-[var(--twax-success)] border-[var(--twax-success)]",
                                    slot.status === "current" &&
                                    "bg-primary border-primary animate-pulse",
                                    slot.status === "upcoming" &&
                                    "bg-transparent border-muted-foreground/40",
                                    slot.status === "skipped" &&
                                    "bg-muted-foreground/30 border-muted-foreground/30"
                                )}
                            />

                            {/* Card offset to the right of the line */}
                            <div className="ml-12">
                                <SlotCard
                                    slot={slot}
                                    isSelected={selected === slot.id}
                                    onClick={() => handleSelect(slot.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
