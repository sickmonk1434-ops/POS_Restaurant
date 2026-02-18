import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tables, bills } from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { number, floorId, capacity } = body;

        // Check for duplicates
        if (number) {
            const existing = await db.query.tables.findFirst({
                where: and(eq(tables.number, number), ne(tables.id, id))
            });
            if (existing) {
                return NextResponse.json({ error: "Table number already exists" }, { status: 409 });
            }
        }

        await db.update(tables)
            .set({
                number,
                floorId,
                capacity: parseInt(capacity.toString()),
            })
            .where(eq(tables.id, id));

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Update Table Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update table" },
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

        // Unlink bills and delete table
        await db.update(bills).set({ tableId: null }).where(eq(bills.tableId, id));
        await db.delete(tables).where(eq(tables.id, id));

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete table" },
            { status: 500 }
        );
    }
}
