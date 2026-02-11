"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Clock,
    Globe,
    Server,
    Zap,
    Activity,
    ExternalLink,
} from "lucide-react";
import { useHealth, useArticles } from "@/lib/queries";
import { DEFAULT_TIME_SLOTS } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { data: health } = useHealth();
    const { data: allArticles } = useArticles(undefined, 100);
    const [backendUrl, setBackendUrl] = useState(
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    );

    const isHealthy = health?.status === "healthy";

    // Compute stats
    const stats = {
        total: allArticles?.length ?? 0,
        approved: allArticles?.filter((a) => a.status === "approved").length ?? 0,
        rejected: allArticles?.filter((a) => a.status === "rejected").length ?? 0,
        deferred: allArticles?.filter((a) => a.status === "deferred").length ?? 0,
        pending: allArticles?.filter((a) => a.status === "pending").length ?? 0,
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="max-w-3xl mx-auto p-6 space-y-8">
                            {/* Page Title */}
                            <div>
                                <h1 className="font-heading text-xl font-bold tracking-wide">
                                    SETTINGS
                                </h1>
                                <p className="text-sm text-muted-foreground font-body mt-1">
                                    Configure your TWAX Command Center
                                </p>
                            </div>

                            {/* ── Backend Connection ── */}
                            <Card className="border-border/30 bg-card/50">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Server className="h-4 w-4 text-primary" />
                                        <h2 className="font-heading text-sm font-bold tracking-wide">
                                            BACKEND CONNECTION
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-lg bg-background/50 border border-border/30 p-3">
                                        <div
                                            className={cn(
                                                "h-3 w-3 rounded-full shrink-0",
                                                isHealthy
                                                    ? "bg-[var(--twax-success)] shadow-[0_0_8px_var(--twax-success)]"
                                                    : "bg-[var(--twax-danger)] shadow-[0_0_8px_var(--twax-danger)]"
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-body font-medium">
                                                {isHealthy ? "Connected" : "Disconnected"}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-body truncate">
                                                {backendUrl}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] uppercase font-heading border",
                                                isHealthy
                                                    ? "text-[var(--twax-success)] border-[var(--twax-success)]/25"
                                                    : "text-[var(--twax-danger)] border-[var(--twax-danger)]/25"
                                            )}
                                        >
                                            {health?.service ?? "unknown"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-heading">
                                            Backend URL
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={backendUrl}
                                                onChange={(e) => setBackendUrl(e.target.value)}
                                                className="flex-1 rounded-md border border-border/40 bg-background/50 px-3 py-1.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                                                placeholder="http://localhost:8000"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="font-body border-border/40 text-muted-foreground hover:text-primary"
                                            >
                                                Test
                                            </Button>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground/50 font-body">
                                            Set via <code className="text-primary/80">NEXT_PUBLIC_BACKEND_URL</code> in{" "}
                                            <code className="text-primary/80">.env.local</code>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ── Posting Schedule ── */}
                            <Card className="border-border/30 bg-card/50">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <h2 className="font-heading text-sm font-bold tracking-wide">
                                            POSTING SCHEDULE
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {DEFAULT_TIME_SLOTS.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="rounded-lg border border-border/30 bg-background/50 p-3 text-center"
                                            >
                                                <span className="font-heading text-sm font-bold text-foreground">
                                                    {slot.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-[11px] text-muted-foreground/50 font-body">
                                        6 posting slots per day. Custom scheduling coming in a future update.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* ── Platforms ── */}
                            <Card className="border-border/30 bg-card/50">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <h2 className="font-heading text-sm font-bold tracking-wide">
                                            PLATFORMS
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { name: "X (Twitter)", enabled: true, handle: "@twax_tech" },
                                            { name: "Bluesky", enabled: false, handle: "Coming soon" },
                                            { name: "LinkedIn", enabled: false, handle: "Coming soon" },
                                        ].map((platform) => (
                                            <div
                                                key={platform.name}
                                                className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            "h-2 w-2 rounded-full",
                                                            platform.enabled
                                                                ? "bg-[var(--twax-success)]"
                                                                : "bg-muted-foreground/30"
                                                        )}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-body font-medium">
                                                            {platform.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-body">
                                                            {platform.handle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] uppercase font-heading",
                                                        platform.enabled
                                                            ? "text-[var(--twax-success)] border-[var(--twax-success)]/25"
                                                            : "text-muted-foreground border-border/30"
                                                    )}
                                                >
                                                    {platform.enabled ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ── Stats Summary ── */}
                            <Card className="border-border/30 bg-card/50">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <h2 className="font-heading text-sm font-bold tracking-wide">
                                            STATS OVERVIEW
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: "Total", value: stats.total, color: "text-foreground" },
                                            {
                                                label: "Approved",
                                                value: stats.approved,
                                                color: "text-[var(--twax-success)]",
                                            },
                                            {
                                                label: "Archived",
                                                value: stats.rejected,
                                                color: "text-[var(--twax-danger)]",
                                            },
                                            {
                                                label: "Pending",
                                                value: stats.pending,
                                                color: "text-primary",
                                            },
                                        ].map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-lg border border-border/30 bg-background/50 p-3 text-center"
                                            >
                                                <p
                                                    className={cn(
                                                        "font-heading text-2xl font-bold tabular-nums",
                                                        stat.color
                                                    )}
                                                >
                                                    {stat.value}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-heading mt-1">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ── About ── */}
                            <Card className="border-border/30 bg-card/50">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-primary" />
                                        <h2 className="font-heading text-sm font-bold tracking-wide">
                                            ABOUT TWAX
                                        </h2>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                                        TWAX (Tech World Aggregator for X) is an AI-powered tech news
                                        curation and multi-platform social publishing system. Powered by
                                        Gemini AI, it aggregates, scores, and curates tech news from 15+ sources.
                                    </p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] font-heading text-primary border-primary/25"
                                        >
                                            v1.0.0
                                        </Badge>
                                        <a
                                            href="https://github.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-body transition-colors"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            GitHub
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
