"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
    children,
    requiredRole
}: {
    children: React.ReactNode;
    requiredRole?: "admin" | "cashier";
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (requiredRole && user.role !== "admin" && user.role !== requiredRole) {
                router.push("/pos");
            }
        }
    }, [user, loading, router, requiredRole]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}
