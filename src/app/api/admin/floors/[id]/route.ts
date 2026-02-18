import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { floors } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        await db.delete(floors).where(eq(floors.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Floor Error:", error);
        return NextResponse.json({ error: "Failed to delete floor" }, { status: 500 });
    }
}
