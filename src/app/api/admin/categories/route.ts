import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, restaurantId } = body;

        const newCategory = await db.insert(categories).values({
            name,
            restaurantId: restaurantId || null,
        }).returning();

        return NextResponse.json(newCategory[0]);
    } catch (error: unknown) {
        console.error("Create Category Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create category" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get("restaurantId");

        const allCategories = restaurantId
            ? await db.query.categories.findMany({ where: eq(categories.restaurantId, restaurantId) })
            : await db.query.categories.findMany();
        return NextResponse.json(allCategories);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
