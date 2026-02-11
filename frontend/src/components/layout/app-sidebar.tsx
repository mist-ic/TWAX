"use client";

import {
    LayoutDashboard,
    History,
    Settings,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { useHealth } from "@/lib/queries";

const NAV_ITEMS = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "History", href: "/history", icon: History },
    { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { data: health } = useHealth();
    const isHealthy = health?.status === "healthy";

    return (
        <Sidebar
            className="border-r border-sidebar-border bg-sidebar"
            collapsible="icon"
        >
            {/* ── Brand ── */}
            <SidebarHeader className="px-4 py-5">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                        <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-heading text-sm font-bold tracking-wider text-foreground">
                            TWAX
                        </span>
                        <span className="text-[10px] text-muted-foreground tracking-wide">
                            COMMAND CENTER
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            {/* ── Navigation ── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-heading">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={
                                                isActive
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            }
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span className="font-body text-sm">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Footer: Status ── */}
            <SidebarFooter className="px-4 py-3 group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-2">
                    <div
                        className={`h-2 w-2 rounded-full ${isHealthy
                                ? "bg-[var(--twax-success)] shadow-[0_0_6px_var(--twax-success)]"
                                : "bg-[var(--twax-danger)] shadow-[0_0_6px_var(--twax-danger)]"
                            }`}
                    />
                    <span className="text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {isHealthy ? "Backend Online" : "Backend Offline"}
                    </span>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
