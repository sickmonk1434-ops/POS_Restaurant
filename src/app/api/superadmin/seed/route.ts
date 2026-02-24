import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants, users, floors, tables, categories, menuItems, bills, auditLogs } from "@/lib/schema";
import { isNull } from "drizzle-orm";

export async function POST() {
    try {
        // Check if MANA MANDI already exists
        const existing = await db.query.restaurants.findFirst();
        if (existing) {
            return NextResponse.json({ message: "Seed already run", restaurantId: existing.id });
        }

        // Create the default restaurant
        const [restaurant] = await db.insert(restaurants).values({
            name: "MANA MANDI",
            address: null,
            phone: null,
        }).returning();

        const rid = restaurant.id;

        // Update all existing records that have null restaurantId
        await db.update(users).set({ restaurantId: rid }).where(isNull(users.restaurantId));
        await db.update(floors).set({ restaurantId: rid }).where(isNull(floors.restaurantId));
        await db.update(tables).set({ restaurantId: rid }).where(isNull(tables.restaurantId));
        await db.update(categories).set({ restaurantId: rid }).where(isNull(categories.restaurantId));
        await db.update(menuItems).set({ restaurantId: rid }).where(isNull(menuItems.restaurantId));
        await db.update(bills).set({ restaurantId: rid }).where(isNull(bills.restaurantId));
        await db.update(auditLogs).set({ restaurantId: rid }).where(isNull(auditLogs.restaurantId));

        return NextResponse.json({ message: "Seed complete", restaurantId: rid });
    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: "Seed failed" }, { status: 500 });
    }
}
