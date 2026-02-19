import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, restaurants } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const adminUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                restaurantId: users.restaurantId,
                restaurantName: restaurants.name,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(restaurants, eq(users.restaurantId, restaurants.id))
            .where(eq(users.role, "admin"));

        return NextResponse.json(adminUsers);
    } catch (error) {
        console.error("Fetch Admin Users Error:", error);
        return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, email, password, restaurantId } = await request.json();
        const newUser = await db.insert(users).values({
            name,
            email,
            password,
            role: "admin",
            restaurantId: restaurantId || null,
        }).returning();
        return NextResponse.json(newUser[0]);
    } catch (error: any) {
        console.error("Create Admin User Error:", error);
        if (error?.message?.includes("UNIQUE")) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 });
    }
}
