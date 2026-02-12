"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { log } from "@/lib/logger";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000, // 30 seconds
                        refetchOnWindowFocus: true,
                        retry: 2,
                    },
                    mutations: {
                        retry: 1,
                    },
                },
            })
    );

    useEffect(() => {
        log.startup();
    }, []);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark"
        >
            <QueryClientProvider client={queryClient}>
                <TooltipProvider delayDuration={300}>
                    {children}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            className: "font-body",
                            style: {
                                background: "oklch(0.17 0.005 285)",
                                border: "1px solid oklch(0.25 0.01 280 / 60%)",
                                color: "oklch(0.96 0.005 250)",
                            },
                        }}
                    />
                </TooltipProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
