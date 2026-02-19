"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    fetchRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    type Restaurant,
} from "@/lib/services/superadmin";

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Restaurant | null>(null);
    const [form, setForm] = useState({ name: "", address: "", phone: "" });

    const load = () => {
        fetchRestaurants()
            .then(setRestaurants)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", address: "", phone: "" });
        setDialogOpen(true);
    };

    const openEdit = (r: Restaurant) => {
        setEditing(r);
        setForm({ name: r.name, address: r.address || "", phone: r.phone || "" });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editing) {
                await updateRestaurant(editing.id, form);
            } else {
                await createRestaurant(form);
            }
            setDialogOpen(false);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this restaurant? This will also remove all associated data.")) return;
        try {
            await deleteRestaurant(id);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleActive = async (r: Restaurant) => {
        try {
            await updateRestaurant(r.id, { isActive: !r.isActive } as any);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Restaurants</h2>
                    <p className="text-muted-foreground">Manage all restaurant locations.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurant
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : restaurants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                        No restaurants yet. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                restaurants.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.name}</TableCell>
                                        <TableCell>{r.address || "—"}</TableCell>
                                        <TableCell>{r.phone || "—"}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={r.isActive ? "default" : "secondary"}
                                                className={r.isActive ? "bg-green-600 hover:bg-green-700 cursor-pointer" : "cursor-pointer"}
                                                onClick={() => handleToggleActive(r)}
                                            >
                                                {r.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Restaurant" : "Add Restaurant"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Restaurant name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="123 Main St"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                            {editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
