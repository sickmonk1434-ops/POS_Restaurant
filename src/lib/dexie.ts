import Dexie, { Table } from 'dexie';

export interface PaymentItem {
    id: string;
    method: 'cash' | 'upi' | 'card';
    amount: number;
    timestamp: Date;
}

export interface BillItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface LocalBill {
    id?: string;
    tableId: string | 'takeaway';
    orderType: 'dine-in' | 'takeaway';
    cashierId: string;
    total: number;
    status: 'pending' | 'paid' | 'cancelled';
    items: BillItem[];
    payments?: PaymentItem[];
    createdAt: Date;
    updatedAt: Date;
    synced: boolean;
}

export interface LocalMenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    isActive: boolean;
}

export interface LocalCategory {
    id: string;
    name: string;
}

export interface LocalFloor {
    id: string;
    name: string;
}

export interface LocalTable {
    id: string;
    number: string;
    capacity: number;
    floorId: string;
}

export class POSDatabase extends Dexie {
    bills!: Table<LocalBill>;
    menuItems!: Table<LocalMenuItem>;
    categories!: Table<LocalCategory>;
    floors!: Table<LocalFloor>;
    restaurantTables!: Table<LocalTable>;

    constructor() {
        super('POSDatabase');
        this.version(1).stores({
            bills: 'id, tableId, cashierId, status, synced',
            menuItems: 'id, name, categoryId, isActive',
            categories: 'id, name',
            floors: 'id, name',
            restaurantTables: 'id, floorId, number'
        });
    }
}

export const localDb = new POSDatabase();
