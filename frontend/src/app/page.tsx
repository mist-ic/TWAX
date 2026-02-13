"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SmartQueue } from "@/components/dashboard/smart-queue";
import { DayTimeline } from "@/components/dashboard/day-timeline";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFetchArticles } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "radix-ui";
import { CalendarDays, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
    useKeyboardShortcuts();
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const fetchMutation = useFetchArticles();

    const handleFetch = () => {
        toast.info("Fetching articles from RSS feeds...", { duration: 3000 });
        fetchMutation.mutate(undefined, {
            onSuccess: (data) => {
                toast.success(
                    `Found ${data.fetched} articles: ${data.new} new, ${data.duplicates} duplicates`,
                    { duration: 5000 }
                );
            },
            onError: (err) => {
                toast.error(`Fetch failed: ${err.message}`, { duration: 5000 });
            },
        });
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-dvh overflow-hidden">
                <Header />

                {/* ── Main Content: Smart Queue + Day Timeline ── */}
                <main className="flex flex-1 min-h-0 overflow-hidden">
                    {/* Smart Queue — scrollable center area */}
                    <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
                        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-6">
                            {/* Fetch button */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-heading font-semibold text-muted-foreground/80 uppercase tracking-wider">
                                    Smart Queue
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFetch}
                                    disabled={fetchMutation.isPending}
                                    className="gap-1.5 text-xs"
                                >
                                    {fetchMutation.isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5" />
                                    )}
                                    {fetchMutation.isPending ? "Fetching..." : "Fetch Articles"}
                                </Button>
                            </div>
                            <SmartQueue />
                        </div>
                    </div>

                    {/* Day Timeline — desktop: fixed right panel */}
                    <aside className="hidden xl:flex w-[300px] shrink-0 border-l border-border/30 bg-card/20 overflow-hidden">
                        <DayTimeline className="w-full" />
                    </aside>
                </main>

                {/* ── Footer ── */}
                <footer className="flex items-center justify-center gap-3 sm:gap-4 border-t border-border/20 bg-background/50 py-2 px-3 shrink-0">
                    {/* Mobile: Schedule drawer trigger */}
                    <Sheet open={scheduleOpen} onOpenChange={setScheduleOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="xl:hidden gap-1.5 text-muted-foreground hover:text-primary text-xs"
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Schedule</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[300px] sm:w-[340px] p-0 bg-background border-border/30"
                            aria-describedby={undefined}
                        >
                            <VisuallyHidden.Root>
                                <SheetTitle>Day Schedule</SheetTitle>
                            </VisuallyHidden.Root>
                            <DayTimeline
                                className="h-full pt-10"
                                onSlotSelect={() => setScheduleOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* Keyboard hints — hidden on mobile */}
                    <div className="hidden sm:flex items-center gap-3">
                        {[
                            { key: "A", label: "Approve" },
                            { key: "S", label: "Skip" },
                            { key: "R", label: "Archive" },
                            { key: "E", label: "Edit" },
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border/40 bg-card/50 px-1.5 font-heading text-[10px] text-muted-foreground">
                                    {key}
                                </kbd>
                                <span className="text-[11px] text-muted-foreground/60 font-body">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    );
}
