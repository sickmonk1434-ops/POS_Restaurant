
const { drizzle } = require("drizzle-orm/libsql");
const { createClient } = require("@libsql/client");
const { eq } = require("drizzle-orm");
// We can't easily import from ts files in a quick script, so we'll define table objects manually or just use raw SQL for diag
// But better to use the exact schema if possible.
// Actually, I'll just try to use raw SQL to see what the constraint error is.

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function diag() {
    const idToDelete = process.argv[2];
    if (!idToDelete) {
        console.error("Please provide an ID to delete");
        process.exit(1);
    }

    try {
        console.log(`Checking for references for ID: ${idToDelete}`);
        const refs = await client.execute({
            sql: "SELECT count(*) as count FROM bill_items WHERE menu_item_id = ?",
            args: [idToDelete]
        });
        console.log(`Bill Items referencing this: ${refs.rows[0].count}`);

        console.log("Attempting deletion...");
        await client.execute({
            sql: "DELETE FROM menu_items WHERE id = ?",
            args: [idToDelete]
        });
        console.log("Delete successful!");
    } catch (error) {
        console.error("Delete FAILED:");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

diag();
