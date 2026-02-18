import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, categoryId, isActive } = body;

        // Check for existing menu item name
        const existing = await db.query.menuItems.findFirst({
            where: eq(menuItems.name, name)
        });

        if (existing) {
            return NextResponse.json({ error: "Menu item name already exists" }, { status: 409 });
        }

        const newItem = await db.insert(menuItems).values({
            name,
            description,
            price: parseFloat(price.toString()),
            categoryId,
            isActive: isActive ?? true,
        }).returning();

        return NextResponse.json(newItem[0]);
    } catch (error: unknown) {
        console.error("Create Menu Item Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create menu item" },
            { status: 500 }
        );
    }
}
