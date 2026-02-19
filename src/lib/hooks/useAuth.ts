"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "superadmin" | "admin" | "cashier";
    restaurantId?: string;
    restaurantName?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem("pos_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        localStorage.setItem("pos_user", JSON.stringify(userData));
        setUser(userData);
        router.push(userData.role === "superadmin" ? "/superadmin" : userData.role === "admin" ? "/admin" : "/pos");
    };

    const logout = () => {
        localStorage.removeItem("pos_user");
        setUser(null);
        router.push("/login");
    };

    return { user, loading, login, logout };
};
