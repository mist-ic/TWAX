/* ═══════════════════════════════════════
   TWAX Logger — color-coded, component-tagged dev logging
   Only active when NEXT_PUBLIC_DEBUG=true && NODE_ENV=development
   ═══════════════════════════════════════ */

const IS_DEV = process.env.NODE_ENV === "development";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === "true";
const ENABLED = IS_DEV && DEBUG;

/* ─── Color Palette ─── */
const COLORS = {
    api: "#3b82f6",       // Blue
    query: "#22c55e",     // Green
    mutation: "#f59e0b",  // Amber
    optimistic: "#a855f7", // Purple
    component: "#ec4899", // Pink
    error: "#ef4444",     // Red
    info: "#6b7280",      // Gray
} as const;

type LogCategory = keyof typeof COLORS;

function styled(category: LogCategory, tag: string) {
    const color = COLORS[category];
    return [
        `%c[${tag}]`,
        `color: ${color}; font-weight: bold; background: ${color}11; padding: 1px 4px; border-radius: 3px;`,
    ] as const;
}

/* ─── Public API ─── */

export const log = {
    /** API layer: requests, responses, timing */
    api(tag: string, message: string, data?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("api", tag);
        if (data !== undefined) {
            console.log(fmt, style, message, data);
        } else {
            console.log(fmt, style, message);
        }
    },

    /** TanStack Query lifecycle */
    query(tag: string, message: string, data?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("query", tag);
        if (data !== undefined) {
            console.log(fmt, style, message, data);
        } else {
            console.log(fmt, style, message);
        }
    },

    /** Mutations */
    mutation(tag: string, message: string, data?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("mutation", tag);
        if (data !== undefined) {
            console.log(fmt, style, message, data);
        } else {
            console.log(fmt, style, message);
        }
    },

    /** Optimistic cache updates */
    optimistic(tag: string, message: string, data?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("optimistic", tag);
        if (data !== undefined) {
            console.log(fmt, style, message, data);
        } else {
            console.log(fmt, style, message);
        }
    },

    /** Component renders and user interactions */
    component(tag: string, message: string, data?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("component", tag);
        if (data !== undefined) {
            console.log(fmt, style, message, data);
        } else {
            console.log(fmt, style, message);
        }
    },

    /** Errors */
    error(tag: string, message: string, error?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("error", tag);
        console.error(fmt, style, message, error ?? "");
    },

    /** General info */
    info(tag: string, message: string, data?: unknown) {
        if (!ENABLED) return;
        const [fmt, style] = styled("info", tag);
        if (data !== undefined) {
            console.log(fmt, style, message, data);
        } else {
            console.log(fmt, style, message);
        }
    },

    /** Log startup/mode info */
    startup() {
        if (!ENABLED) return;
        const mode = process.env.NEXT_PUBLIC_USE_MOCK === "true" ? "MOCK" : "LIVE";
        const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        console.log(
            "%c[TWAX] %cStartup",
            "color: #f59e0b; font-weight: bold; font-size: 14px;",
            "color: #8b8b9a;",
        );
        console.log(
            `%c  Mode: ${mode}${mode === "LIVE" ? ` → ${url}` : ""}`,
            `color: ${mode === "LIVE" ? "#22c55e" : "#f59e0b"}; font-weight: bold;`,
        );
        console.log(
            `%c  Debug: ${DEBUG ? "ON" : "OFF"}`,
            "color: #6b7280;",
        );
    },
};
