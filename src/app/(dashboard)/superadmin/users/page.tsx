"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    fetchAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    fetchRestaurants,
    type AdminUser,
    type Restaurant,
} from "@/lib/services/superadmin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", restaurantId: "" });

    const load = () => {
        Promise.all([fetchAdminUsers(), fetchRestaurants()])
            .then(([u, r]) => { setUsers(u); setRestaurants(r); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", email: "", password: "", restaurantId: "" });
        setDialogOpen(true);
    };

    const openEdit = (u: AdminUser) => {
        setEditing(u);
        setForm({ name: u.name, email: u.email, password: "", restaurantId: u.restaurantId || "" });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editing) {
                const data: any = { name: form.name, email: form.email, restaurantId: form.restaurantId || null };
                if (form.password) data.password = form.password;
                await updateAdminUser(editing.id, data);
            } else {
                await createAdminUser({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    restaurantId: form.restaurantId || undefined,
                });
            }
            setDialogOpen(false);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this admin user?")) return;
        try {
            await deleteAdminUser(id);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
                    <p className="text-muted-foreground">Manage admin accounts for each restaurant.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Restaurant</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                        No admin users yet. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.restaurantName || "—"}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
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
                        <DialogTitle>{editing ? "Edit Admin User" : "Add Admin User"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="admin@restaurant.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{editing ? "Password (leave empty to keep current)" : "Password *"}</Label>
                            <Input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Restaurant</Label>
                            <Select value={form.restaurantId} onValueChange={(val) => setForm({ ...form, restaurantId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select restaurant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {restaurants.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!form.name.trim() || !form.email.trim() || (!editing && !form.password.trim())}
                        >
                            {editing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
