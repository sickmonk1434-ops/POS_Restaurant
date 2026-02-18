"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { localDb } from "@/lib/dexie";
import { useAuth } from "@/lib/hooks/useAuth";
import { logAction } from "@/lib/services/audit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BillHistoryPage() {
    const { user } = useAuth();
    const bills = useLiveQuery(() => localDb.bills.toArray()) || [];

    const handleCancelBill = async (bill: any) => {
        if (!confirm(`Are you sure you want to cancel bill ${bill.id.substring(0, 8)}?`)) return;

        try {
            // 1. Log the action (Audit)
            await logAction("DELETE", "orders", bill.id, user?.id || "unknown", bill);

            // 2. Update status in local DB
            await localDb.bills.update(bill.id, { status: "cancelled", updatedAt: new Date() });

            alert("Bill has been cancelled and audit log created.");
        } catch (error) {
            console.error("Failed to cancel bill:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Bill History</h2>
                <p className="text-muted-foreground">View and manage recent bills.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bill ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-mono text-xs">{bill.id?.substring(0, 8)}...</TableCell>
                                    <TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
                                    <TableCell className="font-bold">₹{bill.total}</TableCell>
                                    <TableCell>
                                        <Badge variant={bill.status === "paid" ? "default" : "destructive"}>
                                            {bill.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        {bill.status !== "cancelled" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleCancelBill(bill)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bills.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                        No bills found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
