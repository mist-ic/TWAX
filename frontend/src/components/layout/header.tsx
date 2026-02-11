"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from "lucide-react";
import { usePendingArticles, useApprovedArticles } from "@/lib/queries";
import { CountdownTimer } from "@/components/shared/countdown-timer";

export function Header() {
    const { data: pending } = usePendingArticles();
    const { data: approved } = useApprovedArticles();

    const pendingCount = pending?.length ?? 0;
    const approvedCount = approved?.length ?? 0;

    return (
        <header className="flex h-14 items-center gap-3 border-b border-border/40 px-4 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            <Separator orientation="vertical" className="h-5" />

            {/* Page title */}
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h1 className="font-heading text-sm font-bold tracking-wide">
                    DASHBOARD
                </h1>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats */}
            <div className="flex items-center gap-3">
                <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/10 text-primary border border-primary/20 font-body text-xs"
                >
                    <span className="font-bold">{pendingCount}</span> pending
                </Badge>
                <Badge
                    variant="secondary"
                    className="gap-1.5 bg-[var(--twax-success)]/10 text-[var(--twax-success)] border border-[var(--twax-success)]/20 font-body text-xs"
                >
                    <span className="font-bold">{approvedCount}</span> posted
                </Badge>

                <Separator orientation="vertical" className="h-5" />

                {/* Countdown to next slot */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <CountdownTimer className="text-xs font-body" />
                </div>
            </div>
        </header>
    );
}
