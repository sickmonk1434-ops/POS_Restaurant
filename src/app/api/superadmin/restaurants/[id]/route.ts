import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await db.update(restaurants)
            .set(body)
            .where(eq(restaurants.id, id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Update Restaurant Error:", error);
        return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(restaurants).where(eq(restaurants.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Restaurant Error:", error);
        return NextResponse.json({ error: "Failed to delete restaurant" }, { status: 500 });
    }
}
