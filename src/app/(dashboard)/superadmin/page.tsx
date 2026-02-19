"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, FileText } from "lucide-react";
import { fetchStats, type Stats } from "@/lib/services/superadmin";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
                <p className="text-muted-foreground">Manage all restaurants from one place.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription>Total Restaurants</CardDescription>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {loading ? "..." : stats?.restaurantCount ?? 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription>Admin Users</CardDescription>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {loading ? "..." : stats?.adminCount ?? 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardDescription>Total Bills (Synced)</CardDescription>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {loading ? "..." : stats?.totalBills ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Bills synced to Turso</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
