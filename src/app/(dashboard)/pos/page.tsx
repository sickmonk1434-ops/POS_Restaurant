"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLiveQuery } from "dexie-react-hooks";
import { localDb } from "@/lib/dexie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Minus, Trash2, ShoppingCart, Search, LayoutGrid, FileClock, Utensils, Bike, Check, X, MousePointer2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simulateKOTPrint } from "@/lib/services/kot";
import { LocalBill, LocalTable, LocalCategory, LocalFloor, LocalMenuItem, PaymentItem } from "@/lib/dexie";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

type POSView = 'landing' | 'table_selection' | 'menu';

export default function POSPage() {
    const { user } = useAuth();
    const [view, setView] = useState<POSView>('landing');
    const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [tableSearch, setTableSearch] = useState("");
    const [tableFilter, setTableFilter] = useState<'all' | 'available' | 'occupied'>('all');

    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [activeBillId, setActiveBillId] = useState<string | null>(null);

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [payments, setPayments] = useState<Partial<PaymentItem>[]>([{ id: crypto.randomUUID(), method: 'cash', amount: 0 }]);

    // Live queries
    const categoriesRaw = useLiveQuery(() => localDb.categories.toArray());
    const menuItemsRaw = useLiveQuery(() => localDb.menuItems.toArray());
    const floorsRaw = useLiveQuery(() => localDb.floors.toArray());
    const tablesRaw = useLiveQuery(() => localDb.restaurantTables.toArray());
    const runningBillsRaw = useLiveQuery(() => localDb.bills.where("status").equals("pending").toArray());

    const categories = useMemo(() => categoriesRaw || [] as LocalCategory[], [categoriesRaw]);
    const menuItems = useMemo(() => menuItemsRaw || [] as LocalMenuItem[], [menuItemsRaw]);
    const floors = useMemo(() => floorsRaw || [] as LocalFloor[], [floorsRaw]);
    const tables = useMemo(() => {
        if (!tablesRaw) return [] as LocalTable[];
        return [...tablesRaw].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }));
    }, [tablesRaw]);
    const runningBills = useMemo(() => runningBillsRaw || [] as LocalBill[], [runningBillsRaw]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return menuItems;
        return menuItems.filter((item: LocalMenuItem) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [menuItems, searchQuery]);

    const filteredTables = useMemo(() => {
        let result = tables;
        if (tableSearch) {
            result = result.filter(t => t.number.toLowerCase().includes(tableSearch.toLowerCase()));
        }
        if (tableFilter === 'available') {
            result = result.filter(t => !runningBills.some(b => b.tableId === t.id));
        } else if (tableFilter === 'occupied') {
            result = result.filter(t => runningBills.some(b => b.tableId === t.id));
        }
        return result;
    }, [tables, tableSearch, tableFilter, runningBills]);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Add tax logic here if needed

    // Payment Logic
    const paidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingAmount = total - paidAmount;

    const addPaymentRow = () => {
        setPayments(prev => [...prev, { id: crypto.randomUUID(), method: 'cash', amount: remainingAmount > 0 ? remainingAmount : 0 }]);
    };

    const removePaymentRow = (id: string) => {
        if (payments.length === 1) return;
        setPayments(prev => prev.filter(p => p.id !== id));
    };

    const updatePayment = (id: string, updates: Partial<PaymentItem>) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleKOT = async () => {
        if (cart.length === 0) return;
        const table = tables.find((t: LocalTable) => t.id === selectedTableId);
        await simulateKOTPrint(table?.number || "Takeaway", cart);
        alert("KOT sent to kitchen!");
    };

    const handleSaveBill = async (status: 'pending' | 'paid') => {
        if (cart.length === 0 || (orderType === 'dine-in' && !selectedTableId)) {
            alert("Please select items and a table (for dine-in).");
            return;
        }

        if (status === 'paid' && remainingAmount !== 0) {
            alert(`Payment incomplete. Remaining: ₹${remainingAmount}`);
            return;
        }

        const billData = {
            id: activeBillId || crypto.randomUUID(),
            tableId: selectedTableId || 'takeaway',
            orderType,
            cashierId: user?.id || "unknown",
            total,
            status,
            items: cart,
            payments: status === 'paid' ? payments.map(p => ({
                id: p.id || crypto.randomUUID(),
                method: p.method || 'cash',
                amount: p.amount || 0,
                timestamp: p.timestamp || new Date()
            })) as PaymentItem[] : [],
            createdAt: activeBillId ? undefined : new Date(),
            updatedAt: new Date(),
            synced: false
        };

        try {
            if (activeBillId) {
                await localDb.bills.update(activeBillId, billData as any);
            } else {
                await localDb.bills.add(billData as any);
            }

            resetPOS();
            alert(status === 'paid' ? "Bill finalized!" : "Bill parked.");
        } catch (error) {
            console.error("Failed to save bill:", error);
        }
    };

    const resetPOS = () => {
        setCart([]);
        setSelectedTableId(null);
        setActiveBillId(null);
        setView('landing');
        setIsPaymentOpen(false);
        setPayments([{ id: crypto.randomUUID(), method: 'cash', amount: 0 }]);
    };

    const loadRunningBill = (bill: LocalBill) => {
        setCart(bill.items);
        setSelectedTableId(bill.tableId === 'takeaway' ? null : bill.tableId);
        setActiveBillId(bill.id!);
        setOrderType(bill.orderType);
        setView('menu');
    };

    const selectedTable = tables.find(t => t.id === selectedTableId);

    // Landing View Components
    if (view === 'landing') {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-12 max-w-4xl w-full">
                    <button
                        onClick={() => { setOrderType('dine-in'); setView('table_selection'); }}
                        className="group flex flex-col items-center justify-center p-12 bg-card border-4 border-transparent hover:border-primary hover:shadow-2xl transition-all rounded-3xl"
                    >
                        <div className="p-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-6">
                            <Utensils className="h-20 w-20 text-primary" />
                        </div>
                        <h2 className="text-4xl font-black mb-2">Dine-in</h2>
                        <p className="text-muted-foreground text-center">Select table and serve customer</p>
                    </button>

                    <button
                        onClick={() => { setOrderType('takeaway'); setSelectedTableId(null); setView('menu'); }}
                        className="group flex flex-col items-center justify-center p-12 bg-card border-4 border-transparent hover:border-orange-500 hover:shadow-2xl transition-all rounded-3xl"
                    >
                        <div className="p-8 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors mb-6">
                            <Bike className="h-20 w-20 text-orange-500" />
                        </div>
                        <h2 className="text-4xl font-black mb-2">Takeaway</h2>
                        <p className="text-muted-foreground text-center">Fast billing for carry-out orders</p>
                    </button>

                    <div className="md:col-span-2 flex justify-center mt-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="lg" className="rounded-full gap-2 px-8 py-6 text-lg">
                                    <FileClock className="h-6 w-6" /> Running Tables ({runningBills.length})
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle className="text-2xl font-bold">Active Orders</DialogTitle></DialogHeader>
                                <div className="grid gap-3 py-6">
                                    {runningBills.map(bill => (
                                        <Button key={bill.id} variant="outline" className="h-20 justify-between px-6 border-2" onClick={() => loadRunningBill(bill)}>
                                            <div className="flex flex-col items-start">
                                                <span className="text-lg font-bold">Table {tables.find(t => t.id === bill.tableId)?.number || 'Takeaway'}</span>
                                                <span className="text-xs text-muted-foreground">{bill.items.length} items • {new Date(bill.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="text-2xl font-black text-primary">₹{bill.total}</div>
                                        </Button>
                                    ))}
                                    {runningBills.length === 0 && <div className="text-center py-12 italic text-muted-foreground">No active bills.</div>}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }

    // Table Selection View (Inspired by reference image)
    if (view === 'table_selection') {
        return (
            <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
                <div className="bg-card border rounded-2xl shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex bg-muted p-1 rounded-xl w-full md:w-auto">
                            <Button variant={tableFilter === 'all' ? "default" : "ghost"} className="flex-1 md:px-8 rounded-lg font-bold" onClick={() => setTableFilter('all')}>All</Button>
                            <Button variant={tableFilter === 'available' ? "default" : "ghost"} className="flex-1 md:px-8 rounded-lg font-bold" onClick={() => setTableFilter('available')}>Available</Button>
                            <Button variant={tableFilter === 'occupied' ? "default" : "ghost"} className="flex-1 md:px-8 rounded-lg font-bold" onClick={() => setTableFilter('occupied')}>Occupied</Button>
                        </div>
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Table Search" className="pl-10 h-12 rounded-xl text-lg border-2 focus-visible:ring-primary" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />
                        </div>
                        <Button variant="ghost" className="h-12 w-12 rounded-xl border-2" onClick={() => setView('landing')}><X className="h-6 w-6" /></Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-12">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {filteredTables.map(table => {
                            const activeBill = runningBills.find(b => b.tableId === table.id);
                            return (
                                <button
                                    key={table.id}
                                    onClick={() => {
                                        if (activeBill) loadRunningBill(activeBill);
                                        else { setSelectedTableId(table.id); setView('menu'); }
                                    }}
                                    className={cn(
                                        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border-b-8",
                                        activeBill
                                            ? "bg-orange-500 text-white border-orange-700 shadow-orange-200"
                                            : "bg-green-500 text-white border-green-700 shadow-green-200",
                                        "shadow-lg hover:brightness-110"
                                    )}
                                >
                                    <div className="p-3 rounded-full bg-white/20">
                                        <Utensils className="h-8 w-8" />
                                    </div>
                                    <span className="text-xl font-black">{table.number}</span>
                                    {activeBill && <span className="text-[10px] font-bold px-2 py-0.5 bg-black/20 rounded-full">₹{activeBill.total}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Default Menu View (Existing POS UI with enhancements)
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Menu Section */}
            <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 rounded-xl" onClick={() => setView(orderType === 'dine-in' ? 'table_selection' : 'landing')}>
                        <MousePointer2 className="mr-2 h-4 w-4" /> Switch Mode
                    </Button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search menu items..."
                            className="pl-9 h-12 bg-background rounded-xl border-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl border-2">
                    <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-black">Menu</CardTitle>
                                <TabsList className="bg-muted/50 p-1 rounded-xl">
                                    <TabsTrigger value="all" className="rounded-lg px-6 font-bold">All</TabsTrigger>
                                    {categories.map(cat => (
                                        <TabsTrigger key={cat.id} value={cat.id} className="rounded-lg px-6 font-bold">{cat.name}</TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 border-t bg-muted/5">
                            <TabsContent value="all" className="m-0">
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => addToCart(item)}
                                            className="group flex flex-col text-left p-5 rounded-2xl border-2 bg-card hover:border-primary hover:shadow-xl transition-all active:scale-95 text-xl font-bold"
                                        >
                                            <span className="group-hover:text-primary transition-colors leading-tight mb-2">{item.name}</span>
                                            <Badge variant="secondary" className="w-fit text-lg py-1 px-3 rounded-lg">₹{item.price}</Badge>
                                        </button>
                                    ))}
                                </div>
                            </TabsContent>
                            {/* ... individual categories ... */}
                            {categories.map(cat => (
                                <TabsContent key={cat.id} value={cat.id} className="m-0">
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredItems.filter(i => i.categoryId === cat.id).map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => addToCart(item)}
                                                className="group flex flex-col text-left p-5 rounded-2xl border-2 bg-card hover:border-primary hover:shadow-xl transition-all active:scale-95 text-xl font-bold"
                                            >
                                                <span className="group-hover:text-primary transition-colors leading-tight mb-2">{item.name}</span>
                                                <Badge variant="secondary" className="w-fit text-lg py-1 px-3 rounded-lg">₹{item.price}</Badge>
                                            </button>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </CardContent>
                    </Tabs>
                </Card>
            </div>

            {/* Bill Section */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
                <Card className="h-full flex flex-col overflow-hidden border-2 border-primary/20 shadow-2xl rounded-2xl">
                    <CardHeader className="pb-4 bg-primary/5 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl font-black">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                                {orderType === 'dine-in' ? `Table ${selectedTable?.number}` : 'Takeaway'}
                            </CardTitle>
                            <Badge variant={orderType === 'dine-in' ? "default" : "secondary"}>#{orderType.toUpperCase()}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                        {cart.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="font-bold">Item</TableHead>
                                        <TableHead className="text-center font-bold">Qty</TableHead>
                                        <TableHead className="text-right font-bold">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map(item => (
                                        <TableRow key={item.id} className="group border-b">
                                            <TableCell className="py-4">
                                                <div className="font-bold text-lg">{item.name}</div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-destructive flex items-center gap-1 opacity-0 group-hover:opacity-100 mt-1 transition-opacity"><Trash2 className="h-3 w-3" /> Remove</button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-3">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="bg-muted h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black hover:text-white transition-colors"><Minus className="h-4 w-4" /></button>
                                                    <span className="w-6 text-center font-black text-xl">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="bg-primary h-8 w-8 flex items-center justify-center rounded-lg text-white hover:brightness-110 transition-colors"><Plus className="h-4 w-4" /></button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-lg text-primary">₹{(item.price * item.quantity).toFixed(0)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-4">
                                <div className="p-6 bg-muted rounded-full animate-pulse"><ShoppingCart className="h-12 w-12 opacity-30" /></div>
                                <p className="font-bold">Waiting for tasty items...</p>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-6 bg-muted/20 border-t space-y-4">
                        <div className="flex justify-between font-black text-3xl p-2">
                            <span>Total</span>
                            <span className="text-primary italic">₹{total.toFixed(0)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="h-16 text-lg font-bold rounded-xl" onClick={handleKOT} disabled={cart.length === 0}>KOT</Button>
                            <Button variant="secondary" className="h-16 text-lg font-bold rounded-xl" onClick={() => handleSaveBill('pending')} disabled={cart.length === 0}>Park</Button>
                            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-16 text-lg font-extrabold rounded-xl shadow-xl shadow-primary/20" disabled={cart.length === 0}>PAY</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-black flex justify-between">
                                            <span>Payment Details</span>
                                            <span className="text-primary italic">Total: ₹{total}</span>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="py-6 space-y-4">
                                        {payments.map((p, idx) => (
                                            <div key={p.id} className="flex gap-4 items-center animate-in slide-in-from-left-4">
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <Select value={p.method} onValueChange={(val: any) => updatePayment(p.id!, { method: val })}>
                                                        <SelectTrigger className="h-14 font-bold text-lg"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">💵 Cash</SelectItem>
                                                            <SelectItem value="upi">📱 UPI</SelectItem>
                                                            <SelectItem value="card">💳 Card</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="number"
                                                        className="h-14 text-xl font-black"
                                                        value={p.amount}
                                                        onChange={(e) => updatePayment(p.id!, { amount: parseFloat(e.target.value) || 0 })}
                                                        autoFocus={idx === payments.length - 1}
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-14 w-14 text-destructive" onClick={() => removePaymentRow(p.id!)} disabled={payments.length === 1}><Trash2 className="h-8 w-8" /></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full h-12 border-dashed border-2 font-bold" onClick={addPaymentRow}>+ Add Payment Mode (Split Payment)</Button>

                                        <div className={cn(
                                            "mt-8 p-6 rounded-2xl flex justify-between items-center text-2xl font-black",
                                            remainingAmount === 0 ? "bg-green-500/10 text-green-600" : "bg-primary/5 text-primary"
                                        )}>
                                            <span>Remaining: ₹{remainingAmount}</span>
                                            {remainingAmount === 0 && <Check className="h-10 w-10" />}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl font-bold" onClick={() => setIsPaymentOpen(false)}>Back</Button>
                                        <Button size="lg" className="h-14 px-12 rounded-xl font-black text-xl shadow-lg" onClick={() => handleSaveBill('paid')} disabled={remainingAmount !== 0}>FINALIZE BILL</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
