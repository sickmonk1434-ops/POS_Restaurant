"use client";

import { useState, useMemo } from "react";
import { localDb, LocalFloor, LocalTable } from "@/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, LayoutGrid, Loader2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { syncMenuData } from "@/lib/services/sync";

export default function FloorsPage() {
    const [loading, setLoading] = useState(false);
    const [isFloorDialogOpen, setIsFloorDialogOpen] = useState(false);
    const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);

    // Form States
    const [floorName, setFloorName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [selectedFloorId, setSelectedFloorId] = useState("");
    const [capacity, setCapacity] = useState("4");
    const [editingTable, setEditingTable] = useState<LocalTable | null>(null);
    const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);

    const floorsRaw = useLiveQuery(() => localDb.floors.toArray());
    const tablesRaw = useLiveQuery(() => localDb.restaurantTables.toArray());

    const floors = useMemo(() => floorsRaw || [] as LocalFloor[], [floorsRaw]);
    const tables = useMemo(() => {
        if (!tablesRaw) return [] as LocalTable[];
        return [...tablesRaw].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }));
    }, [tablesRaw]);

    const handleAddFloor = async () => {
        if (!floorName) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/floors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: floorName }),
            });
            if (res.ok) {
                setFloorName("");
                setIsFloorDialogOpen(false);
                await syncMenuData(); // Refresh local DB
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTable = async () => {
        if (!tableNumber || !selectedFloorId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    number: tableNumber,
                    floorId: selectedFloorId,
                    capacity: parseInt(capacity)
                }),
            });
            if (res.ok) {
                setTableNumber("");
                setIsTableDialogOpen(false);
                await syncMenuData(); // Refresh local DB
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFloor = async (id: string) => {
        if (!confirm("Are you sure? This will delete all tables on this floor.")) return;
        try {
            await fetch(`/api/admin/floors/${id}`, { method: "DELETE" });
            await syncMenuData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTable = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }
            await syncMenuData();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "An error occurred");
        }
    };

    const handleEditTable = async () => {
        if (!editingTable || !tableNumber || !selectedFloorId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tables/${editingTable.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    number: tableNumber,
                    floorId: selectedFloorId,
                    capacity: capacity
                }),
            });
            if (res.ok) {
                setIsEditTableDialogOpen(false);
                setEditingTable(null);
                setTableNumber("");
                setSelectedFloorId("");
                setCapacity("4");
                await syncMenuData();
            } else {
                const data = await res.json();
                alert(data.error || "Update failed");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during update");
        } finally {
            setLoading(false);
        }
    };

    const openEditDialog = (table: LocalTable) => {
        setEditingTable(table);
        setTableNumber(table.number);
        setSelectedFloorId(table.floorId || "");
        setCapacity(table.capacity.toString());
        setIsEditTableDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Floors & Tables</h2>
                    <p className="text-muted-foreground">Manage your restaurant layout and table assignments.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isFloorDialogOpen} onOpenChange={setIsFloorDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <LayoutGrid className="h-4 w-4" /> Add Floor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Floor</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="floor-name">Floor Name</Label>
                                    <Input
                                        id="floor-name"
                                        placeholder="e.g. Ground Floor, Rooftop"
                                        value={floorName}
                                        onChange={(e) => setFloorName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddFloor} disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Floor
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Table
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Table</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="table-num">Table Number/Name</Label>
                                    <Input
                                        id="table-num"
                                        placeholder="e.g. T1, A5"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Floor</Label>
                                    <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Floor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {floors.map(f => (
                                                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddTable} disabled={loading || floors.length === 0}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Table
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Floors</CardTitle>
                        <CardDescription>Manage restaurant sections/levels.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {floors.map(floor => (
                                    <TableRow key={floor.id}>
                                        <TableCell className="font-medium">{floor.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDeleteFloor(floor.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {floors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground italic">No floors added.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Tables</CardTitle>
                        <CardDescription>Assign tables to floors and set capacity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Floor</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tables.map((table: LocalTable) => {
                                    const floor = floors.find((f: LocalFloor) => f.id === table.floorId);
                                    return (
                                        <TableRow key={table.id}>
                                            <TableCell className="font-bold">Table {table.number}</TableCell>
                                            <TableCell>{floor?.name || "Unknown"}</TableCell>
                                            <TableCell>{table.capacity} Person</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500"
                                                    onClick={() => openEditDialog(table)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDeleteTable(table.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {tables.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground italic">No tables added.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Table Dialog */}
            <Dialog open={isEditTableDialogOpen} onOpenChange={setIsEditTableDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Table</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-table-num">Table Number/Name</Label>
                            <Input
                                id="edit-table-num"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Floor</Label>
                            <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Floor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {floors.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-capacity">Capacity</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditTable} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
