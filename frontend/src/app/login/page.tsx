"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                setError("Wrong password");
                setPassword("");
            }
        } catch {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Brand */}
                <div className="text-center space-y-3">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
                        <Zap className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-heading text-xl font-bold tracking-wider">
                            TWAX
                        </h1>
                        <p className="text-xs text-muted-foreground tracking-wide font-body mt-1">
                            COMMAND CENTER
                        </p>
                    </div>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoFocus
                            className="w-full rounded-xl border border-border/40 bg-card/50 pl-10 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-[var(--twax-danger)] font-body text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full rounded-xl bg-primary py-3 text-sm font-heading font-bold tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Unlock Dashboard"
                        )}
                    </button>
                </form>

                <p className="text-center text-[10px] text-muted-foreground/40 font-body">
                    Protected access • Session lasts 30 days
                </p>
            </div>
        </div>
    );
}
