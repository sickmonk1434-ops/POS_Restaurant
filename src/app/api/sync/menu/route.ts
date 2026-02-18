import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const categories = await db.query.categories.findMany();
        const menuItems = await db.query.menuItems.findMany();
        const floors = await db.query.floors.findMany();
        const tables = await db.query.tables.findMany();

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
