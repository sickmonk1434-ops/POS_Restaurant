import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants, users, bills } from "@/lib/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
    try {
        const [restaurantCount] = await db.select({ count: count() }).from(restaurants);
        const [adminCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
        const [totalBills] = await db.select({ count: count() }).from(bills);

        return NextResponse.json({
            restaurantCount: restaurantCount.count,
            adminCount: adminCount.count,
            totalBills: totalBills.count,
        });
    } catch (error) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
