"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SmartQueue } from "@/components/dashboard/smart-queue";
import { DayTimeline } from "@/components/dashboard/day-timeline";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function DashboardPage() {
    useKeyboardShortcuts();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
                <Header />

                {/* ── Main Content: Smart Queue + Day Timeline ── */}
                <main className="flex flex-1 overflow-hidden">
                    {/* Smart Queue — left, scrollable */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                        <SmartQueue />
                    </div>

                    {/* Day Timeline — right sidebar */}
                    <aside className="hidden lg:flex w-[320px] border-l border-border/30 bg-card/20">
                        <DayTimeline className="w-full" />
                    </aside>
                </main>

                {/* ── Keyboard Shortcut Hint ── */}
                <footer className="flex items-center justify-center gap-4 border-t border-border/20 bg-background/50 py-2">
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
                </footer>
            </SidebarInset>
        </SidebarProvider>
    );
}
