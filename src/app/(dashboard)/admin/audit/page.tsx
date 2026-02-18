"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch("/api/admin/audit");
                if (!response.ok) throw new Error("Failed to fetch logs");
                const data = await response.json();
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch audit logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getUsername = (log: any) => {
        return log.changedBy?.name || log.changedBy || "Unknown User";
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                <p className="text-muted-foreground">Monitor bill edits, deletions, and other sensitive actions.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Deletions</CardTitle>
                            <CardDescription>Records of all bills deleted from the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Performed By</TableHead>
                                        <TableHead>Bill ID</TableHead>
                                        <TableHead>Reason/Data</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.filter(l => l.action === "DELETE" && l.tableName === "orders").map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">{getUsername(log)}</TableCell>
                                            <TableCell className="font-mono text-xs">{log.recordId}</TableCell>
                                            <TableCell className="text-muted-foreground max-w-xs truncate">
                                                {log.oldData}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.filter(l => l.action === "DELETE").length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                                                No deletions recorded.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Edits</CardTitle>
                            <CardDescription>Records of all bill modifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Performed By</TableHead>
                                        <TableHead>Bill ID</TableHead>
                                        <TableHead>Changes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.filter(l => l.action === "EDIT").map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">{getUsername(log)}</TableCell>
                                            <TableCell className="font-mono text-xs">{log.recordId}</TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-[10px]">
                                                Modified items/quantities...
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.filter(l => l.action === "EDIT").length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                                                No edits recorded.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
