"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import {
    fetchRestaurants,
    fetchReports,
    type Restaurant,
    type ReportsResponse,
} from "@/lib/services/superadmin";

export default function SuperAdminReportsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [reports, setReports] = useState<ReportsResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [startDate, setStartDate] = useState(todayStart.toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        fetchRestaurants().then(setRestaurants).catch(console.error);
    }, []);

    const toggleRestaurant = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === restaurants.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(restaurants.map((r) => r.id));
        }
    };

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await fetchReports(selectedIds, startDate, endDate);
            setReports(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [selectedIds, startDate, endDate]);

    const summary = reports?.summary;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">All Reports</h2>
                <p className="text-muted-foreground">Cross-restaurant analytics and sales data.</p>
            </div>

            <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="flex items-center gap-3 pt-6">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <p className="text-sm text-yellow-700">
                        Reports show synced bills only. Bill sync from POS to Turso is coming in Phase 2.
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Restaurants</Label>
                                <Button variant="ghost" size="sm" onClick={selectAll} className="h-6 text-xs">
                                    {selectedIds.length === restaurants.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {restaurants.map((r) => (
                                    <Badge
                                        key={r.id}
                                        variant={selectedIds.includes(r.id) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleRestaurant(r.id)}
                                    >
                                        {r.name}
                                    </Badge>
                                ))}
                                {restaurants.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No restaurants yet</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-4">
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{summary?.totalSales?.toFixed(0) ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Bills Count</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{summary?.billCount ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Avg Order</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{summary?.avgOrder?.toFixed(0) ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Dine-In Sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{summary?.dineIn?.total?.toFixed(0) ?? 0}</p>
                                <p className="text-xs text-muted-foreground">{summary?.dineIn?.count ?? 0} bills</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Takeaway Sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{summary?.takeaway?.total?.toFixed(0) ?? 0}</p>
                                <p className="text-xs text-muted-foreground">{summary?.takeaway?.count ?? 0} bills</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bills</CardTitle>
                            <CardDescription>
                                Displaying {reports?.bills?.length ?? 0} synced bills.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bill ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Order Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(reports?.bills ?? []).map((bill: any) => (
                                        <TableRow key={bill.id}>
                                            <TableCell className="font-mono text-xs">{bill.id.substring(0, 8)}...</TableCell>
                                            <TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="capitalize">{bill.orderType || "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    bill.status === "paid" ? "default" :
                                                    bill.status === "pending" ? "secondary" :
                                                    "destructive"
                                                } className={
                                                    bill.status === "paid" ? "bg-green-600 hover:bg-green-700" :
                                                    bill.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600 text-black" :
                                                    ""
                                                }>
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">₹{bill.total}</TableCell>
                                        </TableRow>
                                    ))}
                                    {(reports?.bills ?? []).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                                No synced bills found for this period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
