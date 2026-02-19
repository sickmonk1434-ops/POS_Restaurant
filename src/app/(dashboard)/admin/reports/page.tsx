"use client";

import { useState, useMemo } from "react";
import { localDb } from "@/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function toDatetimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState<"daily" | "monthly" | "yearly" | "custom">("daily");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [startDateTime, setStartDateTime] = useState(toDatetimeLocal(todayStart));
    const [endDateTime, setEndDateTime] = useState(toDatetimeLocal(new Date()));

    const bills = useLiveQuery(() => localDb.bills.toArray()) || [];
    const tables = useLiveQuery(() => localDb.restaurantTables.toArray()) || [];

    const tableMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const t of tables) {
            map.set(t.id, t.number);
        }
        return map;
    }, [tables]);

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            const billDate = new Date(bill.createdAt);
            const selected = new Date(selectedDate);

            if (reportType === "daily") {
                return billDate.toDateString() === selected.toDateString();
            }
            if (reportType === "monthly") {
                return billDate.getMonth() === selected.getMonth() && billDate.getFullYear() === selected.getFullYear();
            }
            if (reportType === "yearly") {
                return billDate.getFullYear() === selected.getFullYear();
            }
            if (reportType === "custom") {
                const start = new Date(startDateTime);
                const end = new Date(endDateTime);
                return billDate >= start && billDate <= end;
            }
            return true;
        });
    }, [bills, reportType, selectedDate, startDateTime, endDateTime]);

    const totalSales = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    const billCount = filteredBills.length;
    const avgOrder = billCount > 0 ? totalSales / billCount : 0;

    const paymentBreakdown = useMemo(() => {
        const breakdown = { cash: 0, upi: 0, card: 0 };
        for (const bill of filteredBills) {
            if (bill.payments) {
                for (const p of bill.payments) {
                    breakdown[p.method] += p.amount;
                }
            }
        }
        return breakdown;
    }, [filteredBills]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Sales Reports</h2>
                <p className="text-muted-foreground">Analyze your restaurant performance over time.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select value={reportType} onValueChange={(val: any) => setReportType(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {reportType === "custom" ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Start Date & Time</Label>
                                    <Input type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date & Time</Label>
                                    <Input type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label>Select Date</Label>
                                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-4">
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Sales</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{totalSales.toFixed(0)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Bills Count</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{billCount}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Average Order</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">₹{avgOrder.toFixed(0)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Payment Breakdown</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <p>Cash: ₹{paymentBreakdown.cash.toFixed(0)}</p>
                                <p>UPI: ₹{paymentBreakdown.upi.toFixed(0)}</p>
                                <p>Card: ₹{paymentBreakdown.card.toFixed(0)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bills</CardTitle>
                            <CardDescription>
                                Displaying {billCount} bills for the selected period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bill ID</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBills.map((bill: any) => (
                                        <TableRow key={bill.id}>
                                            <TableCell className="font-mono text-xs">{bill.id.substring(0, 8)}...</TableCell>
                                            <TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {bill.tableId === "takeaway" ? "Takeaway" : (tableMap.get(bill.tableId) ?? bill.tableId)}
                                            </TableCell>
                                            <TableCell className="capitalize">{bill.orderType}</TableCell>
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
                                    {filteredBills.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                                                No sales found for this period.
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
