"use client";

import { useEffect } from "react";
import { syncMenuData } from "@/lib/services/sync";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Read user from localStorage to get restaurantId
        const savedUser = localStorage.getItem("pos_user");
        const user = savedUser ? JSON.parse(savedUser) : null;

        // Skip sync for superadmin (no restaurant context)
        if (user?.role === "superadmin") return;

        const restaurantId = user?.restaurantId;

        // Initial sync
        syncMenuData(restaurantId);

        // Optional: Setup periodic sync or network listener
        const handleOnline = () => {
            console.log("App online, triggering sync...");
            syncMenuData(restaurantId);
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
