import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/schema";

export async function GET() {
    try {
        const allRestaurants = await db.query.restaurants.findMany({
            orderBy: (r, { desc }) => [desc(r.createdAt)],
        });
        return NextResponse.json(allRestaurants);
    } catch (error) {
        console.error("Fetch Restaurants Error:", error);
        return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, address, phone } = await request.json();
        const newRestaurant = await db.insert(restaurants).values({
            name,
            address: address || null,
            phone: phone || null,
        }).returning();
        return NextResponse.json(newRestaurant[0]);
    } catch (error) {
        console.error("Create Restaurant Error:", error);
        return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
    }
}
