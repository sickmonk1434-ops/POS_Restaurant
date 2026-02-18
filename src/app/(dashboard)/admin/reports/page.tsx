"use client";

import { useState, useMemo } from "react";
import { localDb } from "@/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
    const [reportType, setReportType] = useState<"daily" | "monthly" | "yearly" | "custom">("daily");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const bills = useLiveQuery(() => localDb.bills.toArray()) || [];

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
            return true; // Custom range logic would go here
        });
    }, [bills, reportType, selectedDate]);

    const totalSales = filteredBills.reduce((sum, bill) => sum + bill.total, 0);

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
                        <div className="space-y-2">
                            <Label>Select Date</Label>
                            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Sales Summary</span>
                            <span className="text-2xl font-bold text-primary">₹{totalSales.toFixed(0)}</span>
                        </CardTitle>
                        <CardDescription>
                            Displaying {filteredBills.length} bills for the selected period.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bill ID</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Table</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBills.map((bill: any) => (
                                    <TableRow key={bill.id}>
                                        <TableCell className="font-mono text-xs">{bill.id.substring(0, 8)}...</TableCell>
                                        <TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>Walk-in</TableCell>
                                        <TableCell className="text-right font-bold">₹{bill.total}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredBills.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
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
    );
}
