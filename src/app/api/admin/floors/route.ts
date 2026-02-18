import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { floors } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const { name } = await request.json();
        const newFloor = await db.insert(floors).values({ name }).returning();
        return NextResponse.json(newFloor[0]);
    } catch (error) {
        console.error("Floor Creation Error:", error);
        return NextResponse.json({ error: "Failed to create floor" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allFloors = await db.query.floors.findMany();
        return NextResponse.json(allFloors);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch floors" }, { status: 500 });
    }
}
