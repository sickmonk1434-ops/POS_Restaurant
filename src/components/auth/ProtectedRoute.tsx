"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
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
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
                // Cashiers can't access admin pages, but admins can access cashier pages (POS)
                router.push(user.role === "admin" ? "/admin" : "/pos");
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
