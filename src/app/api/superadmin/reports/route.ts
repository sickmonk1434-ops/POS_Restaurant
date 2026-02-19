import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bills, restaurants } from "@/lib/schema";
import { eq, inArray, and, gte, lte, count, sum } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantIds = searchParams.get("restaurantIds")?.split(",").filter(Boolean) || [];
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const conditions = [];

        if (restaurantIds.length > 0) {
            conditions.push(inArray(bills.restaurantId, restaurantIds));
        }
        if (startDate) {
            conditions.push(gte(bills.createdAt, new Date(startDate)));
        }
        if (endDate) {
            conditions.push(lte(bills.createdAt, new Date(endDate)));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const allBills = await db.select().from(bills).where(where);

        const totalSales = allBills.reduce((sum, b) => sum + b.total, 0);
        const billCount = allBills.length;
        const avgOrder = billCount > 0 ? totalSales / billCount : 0;

        const dineInBills = allBills.filter(b => b.orderType === "dine-in");
        const takeawayBills = allBills.filter(b => b.orderType === "takeaway");

        return NextResponse.json({
            bills: allBills,
            summary: {
                totalSales,
                billCount,
                avgOrder,
                dineIn: {
                    count: dineInBills.length,
                    total: dineInBills.reduce((s, b) => s + b.total, 0),
                },
                takeaway: {
                    count: takeawayBills.length,
                    total: takeawayBills.reduce((s, b) => s + b.total, 0),
                },
            },
        });
    } catch (error) {
        console.error("Reports Error:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
