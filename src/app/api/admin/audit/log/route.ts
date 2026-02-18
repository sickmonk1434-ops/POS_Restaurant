import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        await db.insert(auditLogs).values({
            action: data.action,
            tableName: data.tableName,
            recordId: data.recordId,
            changedBy: data.changedBy,
            oldData: JSON.stringify(data.oldData),
            newData: data.newData ? JSON.stringify(data.newData) : null,
            timestamp: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Audit log creation error:", error);
        return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
    }
}
