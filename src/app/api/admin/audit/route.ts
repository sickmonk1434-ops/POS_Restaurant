import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const logs = await db.query.auditLogs.findMany({
            orderBy: [desc(auditLogs.timestamp)],
            with: {
                changedBy: true
            }
        } as any);

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Audit API Error:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
