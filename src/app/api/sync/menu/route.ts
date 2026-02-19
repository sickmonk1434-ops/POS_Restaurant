import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories as categoriesTable, menuItems as menuItemsTable, floors as floorsTable, tables as tablesTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get("restaurantId");

        const categories = restaurantId
            ? await db.query.categories.findMany({ where: eq(categoriesTable.restaurantId, restaurantId) })
            : await db.query.categories.findMany();
        const menuItems = restaurantId
            ? await db.query.menuItems.findMany({ where: eq(menuItemsTable.restaurantId, restaurantId) })
            : await db.query.menuItems.findMany();
        const floors = restaurantId
            ? await db.query.floors.findMany({ where: eq(floorsTable.restaurantId, restaurantId) })
            : await db.query.floors.findMany();
        const tables = restaurantId
            ? await db.query.tables.findMany({ where: eq(tablesTable.restaurantId, restaurantId) })
            : await db.query.tables.findMany();

        return NextResponse.json({
            categories,
            menuItems,
            floors,
            tables
        });
    } catch (error) {
        console.error("API Sync Error:", error);
        return NextResponse.json({ error: "Failed to fetch menu data" }, { status: 500 });
    }
}
