"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Simulate authentication for now (since we need to handle offline/online sync eventually)
        // In a real app, this would call an API route that checks Turso
        if (email === "admin@pos.com" && password === "admin123") {
            login({ id: "1", name: "Admin", email: "admin@pos.com", role: "admin" });
        } else if (email === "cashier@pos.com" && password === "cashier123") {
            login({ id: "2", name: "Cashier", email: "cashier@pos.com", role: "cashier" });
        } else {
            setError("Invalid credentials. Try admin@pos.com / admin123 or cashier@pos.com / cashier123");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">MANA MANDI</CardTitle>
                    <CardDescription>Enter your credentials to access the POS</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@pos.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Sign In</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
