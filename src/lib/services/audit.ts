
export const logAction = async (
    action: "EDIT" | "DELETE",
    tableName: string,
    recordId: string,
    changedBy: string,
    oldData: any,
    newData?: any
) => {
    try {
        const response = await fetch("/api/admin/audit/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action,
                tableName,
                recordId,
                changedBy,
                oldData,
                newData
            })
        });

        if (!response.ok) throw new Error("API failed to log action");
        console.log(`Audit log successfully sent to server: ${action} on ${tableName}`);
    } catch (error) {
        console.error("Failed to create audit log via API:", error);
        // Fallback or retry logic could go here
    }
};
