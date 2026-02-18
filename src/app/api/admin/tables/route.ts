import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tables } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Check for existing table number
        const existing = await db.query.tables.findFirst({
            where: eq(tables.number, data.number)
        });

        if (existing) {
            return NextResponse.json({ error: "Table number already exists" }, { status: 409 });
        }

        const newTable = await db.insert(tables).values({
            number: data.number,
            capacity: data.capacity || 4,
            floorId: data.floorId,
        }).returning();
        return NextResponse.json(newTable[0]);
    } catch (error) {
        console.error("Table Creation Error:", error);
        return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allTables = await db.query.tables.findMany();
        return NextResponse.json(allTables);
    } catch {
        return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
    }
}
