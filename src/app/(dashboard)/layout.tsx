"use client";

import Shell from "@/components/layout/Shell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <Shell>{children}</Shell>
        </ProtectedRoute>
    );
}
