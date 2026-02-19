import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { floors } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { name, restaurantId } = await request.json();
        const newFloor = await db.insert(floors).values({ name, restaurantId: restaurantId || null }).returning();
        return NextResponse.json(newFloor[0]);
    } catch (error) {
        console.error("Floor Creation Error:", error);
        return NextResponse.json({ error: "Failed to create floor" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get("restaurantId");

        const allFloors = restaurantId
            ? await db.query.floors.findMany({ where: eq(floors.restaurantId, restaurantId) })
            : await db.query.floors.findMany();
        return NextResponse.json(allFloors);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch floors" }, { status: 500 });
    }
}
