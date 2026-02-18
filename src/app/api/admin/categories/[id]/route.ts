import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, menuItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        await db.update(categories)
            .set({ name })
            .where(eq(categories.id, id));

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Update Category Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update category" },
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

        // Unlink menu items from this category before deleting
        await db.update(menuItems).set({ categoryId: null }).where(eq(menuItems.categoryId, id));

        await db.delete(categories).where(eq(categories.id, id));
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Category Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete category" },
            { status: 500 }
        );
    }
}
