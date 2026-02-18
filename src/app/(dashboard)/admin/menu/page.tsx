"use client";

import { useState, useMemo } from "react";
import { localDb, LocalMenuItem, LocalCategory } from "@/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Edit, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { syncMenuData } from "@/lib/services/sync";

export default function AdminMenuPage() {
    const [loading, setLoading] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LocalMenuItem | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Category States
    const [catName, setCatName] = useState("");
    const [isAddCatDialogOpen, setIsAddCatDialogOpen] = useState(false);
    const [isEditCatDialogOpen, setIsEditCatDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<LocalCategory | null>(null);

    const categoriesRaw = useLiveQuery(() => localDb.categories.toArray());
    const itemsRaw = useLiveQuery(() => localDb.menuItems.toArray());

    const categories = useMemo(() => categoriesRaw || [] as LocalCategory[], [categoriesRaw]);
    const items = useMemo(() => itemsRaw || [] as LocalMenuItem[], [itemsRaw]);

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setCategoryId("");
        setIsActive(true);
        setEditingItem(null);
        setCatName("");
        setEditingCategory(null);
    };

    const handleAddItem = async () => {
        if (!name || !price || !categoryId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, price, categoryId, isActive }),
            });
            if (res.ok) {
                setIsAddDialogOpen(false);
                resetForm();
                await syncMenuData();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add item");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleEditItem = async () => {
        if (!editingItem || !name || !price || !categoryId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/menu/${editingItem.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, price, categoryId, isActive }),
            });
            if (res.ok) {
                setIsEditDialogOpen(false);
                resetForm();
                await syncMenuData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, itemName: string) => {
        if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || "Delete failed on server");
            }
            await syncMenuData();
        } catch (error) {
            console.error(error);
            alert(`Error: ${error instanceof Error ? error.message : "Error deleting item."}`);
        } finally {
            setLoading(false);
        }
    };

    const openEditDialog = (item: LocalMenuItem) => {
        setEditingItem(item);
        setName(item.name);
        setDescription(item.description || "");
        setPrice(item.price.toString());
        setCategoryId(item.categoryId || "");
        setIsActive(item.isActive);
        setIsEditDialogOpen(true);
    };

    // Category Handlers
    const handleAddCategory = async () => {
        if (!catName) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: catName }),
            });
            if (res.ok) {
                setIsAddCatDialogOpen(false);
                resetForm();
                await syncMenuData();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add category");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory || !catName) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: catName }),
            });
            if (res.ok) {
                setIsEditCatDialogOpen(false);
                resetForm();
                await syncMenuData();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update category");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"? This won't delete items in it.`)) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            await syncMenuData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openEditCatDialog = (cat: LocalCategory) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setIsEditCatDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
                    <p className="text-muted-foreground">Manage your restaurant menu items and categories.</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                            <Plus className="h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Menu Item</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active (Available)</SelectItem>
                                        <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddItem} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Item
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>All Menu Items</CardTitle>
                        <CardDescription>Only Admins can delete items. Cashiers can only view and add.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => {
                                    const category = categories.find(c => c.id === item.categoryId);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{category?.name || "Uncategorized"}</TableCell>
                                            <TableCell>₹{item.price}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEditDialog(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground italic py-8">No menu items found. Add your first item above.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>Organize your items.</CardDescription>
                        </div>
                        <Dialog open={isAddCatDialogOpen} onOpenChange={setIsAddCatDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { resetForm(); setIsAddCatDialogOpen(true); }}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Category</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cat-name">Category Name</Label>
                                        <Input id="cat-name" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Starters" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddCategory} disabled={loading || !catName}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Category
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCatDialog(cat)}>
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id, cat.name)} disabled={loading}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell className="text-center text-muted-foreground italic text-xs py-4">No categories.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Item Name</Label>
                            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-desc">Description</Label>
                            <Input id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-price">Price (₹)</Label>
                            <Input id="edit-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active (Available)</SelectItem>
                                    <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditItem} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Edit Category Dialog */}
            <Dialog open={isEditCatDialogOpen} onOpenChange={setIsEditCatDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-cat-name">Category Name</Label>
                            <Input id="edit-cat-name" value={catName} onChange={(e) => setCatName(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditCategory} disabled={loading || !catName}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
