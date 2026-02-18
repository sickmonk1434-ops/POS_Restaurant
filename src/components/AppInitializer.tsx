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

        // Unregister any existing service workers (to fix 404s from previous PWA attempts)
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    console.log('Unregistering Service Worker:', registration);
                    registration.unregister();
                }
            });
        }

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    return <>{children}</>;
}
