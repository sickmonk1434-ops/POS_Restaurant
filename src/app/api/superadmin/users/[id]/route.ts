import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await db.update(users)
            .set(body)
            .where(eq(users.id, id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(updated[0]);
    } catch (error: any) {
        console.error("Update User Error:", error);
        if (error?.message?.includes("UNIQUE")) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(users).where(eq(users.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete User Error:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
