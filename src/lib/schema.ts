import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    role: text("role", { enum: ["admin", "cashier"] }).notNull().default("cashier"),
    password: text("password").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const floors = sqliteTable("floors", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const tables = sqliteTable("restaurant_tables", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    number: text("number").notNull().unique(),
    capacity: integer("capacity").notNull().default(4),
    floorId: text("floor_id").references(() => floors.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["available", "occupied", "reserved"] }).notNull().default("available"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const categories = sqliteTable("categories", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const menuItems = sqliteTable("menu_items", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    description: text("description"),
    price: real("price").notNull(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const bills = sqliteTable("bills", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    tableId: text("table_id").references(() => tables.id, { onDelete: "set null" }),
    cashierId: text("cashier_id").references(() => users.id),
    total: real("total").notNull().default(0),
    status: text("status", { enum: ["pending", "paid", "cancelled"] }).notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const billItems = sqliteTable("bill_items", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    billId: text("bill_id").references(() => bills.id, { onDelete: "cascade" }),
    menuItemId: text("menu_item_id").references(() => menuItems.id, { onDelete: "set null" }),
    quantity: integer("quantity").notNull(),
    priceAtTime: real("price_at_time").notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    action: text("action", { enum: ["EDIT", "DELETE"] }).notNull(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    changedBy: text("changed_by").references(() => users.id),
    oldData: text("old_data"),
    newData: text("new_data"),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
