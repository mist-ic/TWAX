"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from "lucide-react";
import { usePendingArticles, useApprovedArticles } from "@/lib/queries";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { log } from "@/lib/logger";

export function Header() {
    const { data: pending } = usePendingArticles();
    const { data: approved } = useApprovedArticles();

    const pendingCount = pending?.length ?? 0;
    const approvedCount = approved?.length ?? 0;

    log.component("Header", `Pending: ${pendingCount}, Approved today: ${approvedCount}`);

    return (
        <header className="flex h-12 sm:h-14 items-center gap-2 sm:gap-3 border-b border-border/40 px-3 sm:px-4 bg-background/80 backdrop-blur-sm shrink-0 overflow-hidden">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />

            <Separator orientation="vertical" className="h-4 sm:h-5 hidden sm:block" />

            {/* Page title */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <h1 className="font-heading text-xs sm:text-sm font-bold tracking-wide">
                    DASHBOARD
                </h1>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats — responsive */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Mobile: compact count only | Desktop: full badge */}
                <Badge
                    variant="secondary"
                    className="gap-1 sm:gap-1.5 bg-primary/10 text-primary border border-primary/20 font-body text-[10px] sm:text-xs px-1.5 sm:px-2"
                >
                    <span className="font-bold">{pendingCount}</span>
                    <span className="hidden xs:inline">pending</span>
                </Badge>
                <Badge
                    variant="secondary"
                    className="hidden sm:inline-flex gap-1.5 bg-[var(--twax-success)]/10 text-[var(--twax-success)] border border-[var(--twax-success)]/20 font-body text-xs"
                >
                    <span className="font-bold">{approvedCount}</span> posted
                </Badge>

                <Separator orientation="vertical" className="h-4 sm:h-5" />

                {/* Countdown */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <CountdownTimer className="text-[10px] sm:text-xs font-body" />
                </div>
            </div>
        </header>
    );
}
