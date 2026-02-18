import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        const newCategory = await db.insert(categories).values({
            name,
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
