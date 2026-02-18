"use client";

import { useEffect } from "react";
import { syncMenuData } from "@/lib/services/sync";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initial sync
        syncMenuData();

        // Optional: Setup periodic sync or network listener
        const handleOnline = () => {
            console.log("App online, triggering sync...");
            syncMenuData();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    return <>{children}</>;
}
