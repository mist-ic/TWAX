"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_TIME_SLOTS } from "@/lib/types";

interface CountdownTimerProps {
    className?: string;
}

function getNextSlotTime(): Date | null {
    const now = new Date();

    for (const slot of DEFAULT_TIME_SLOTS) {
        const [hours, minutes] = slot.time.split(":").map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(hours, minutes, 0, 0);

        if (slotTime > now) {
            return slotTime;
        }
    }

    // All slots passed — next is tomorrow's first slot
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = DEFAULT_TIME_SLOTS[0].time.split(":").map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
}

function formatCountdown(diffMs: number): string {
    if (diffMs <= 0) return "Now";

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

export function CountdownTimer({ className }: CountdownTimerProps) {
    const [countdown, setCountdown] = useState<string>("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        function update() {
            const next = getNextSlotTime();
            if (!next) {
                setCountdown("—");
                return;
            }
            const diff = next.getTime() - Date.now();
            setCountdown(formatCountdown(diff));
            setIsUrgent(diff < 15 * 60 * 1000); // < 15 minutes
        }

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span
            className={cn(
                "tabular-nums transition-colors",
                isUrgent && "text-primary font-semibold",
                className
            )}
        >
            {countdown ? `Next: ${countdown}` : "—"}
        </span>
    );
}
