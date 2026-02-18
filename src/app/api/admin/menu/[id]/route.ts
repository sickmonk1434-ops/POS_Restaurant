import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems, billItems } from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, price, categoryId, isActive } = body;

        // Check for duplicates
        if (name) {
            const existing = await db.query.menuItems.findFirst({
                where: and(eq(menuItems.name, name), ne(menuItems.id, id))
            });
            if (existing) {
                return NextResponse.json({ error: "Menu item name already exists" }, { status: 409 });
            }
        }

        await db.update(menuItems)
            .set({
                name,
                description,
                price: parseFloat(price.toString()),
                categoryId,
                isActive,
            })
            .where(eq(menuItems.id, id));

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Update Menu Item Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update item" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Explicitly unlink from bill items to avoid FK constraints issues
        await db.update(billItems).set({ menuItemId: null }).where(eq(billItems.menuItemId, id));

        await db.delete(menuItems).where(eq(menuItems.id, id));
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete item" },
            { status: 500 }
        );
    }
}
