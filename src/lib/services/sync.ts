import { localDb } from "@/lib/dexie";

export const syncMenuData = async (restaurantId?: string) => {
    console.log("Starting menu sync from API...");
    try {
        // 1. Fetch from API (Server)
        const url = restaurantId ? `/api/sync/menu?restaurantId=${restaurantId}` : "/api/sync/menu";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Sync API returned error");

        const { categories, menuItems, floors, tables } = await response.json();

        // 2. Persist to Dexie
        await localDb.transaction('rw', localDb.categories, localDb.menuItems, localDb.floors, localDb.restaurantTables, async () => {
            await localDb.categories.clear();
            await localDb.menuItems.clear();
            await localDb.floors.clear();
            await localDb.restaurantTables.clear();

            await localDb.categories.bulkAdd(categories);
            await localDb.menuItems.bulkAdd(menuItems);
            await localDb.floors.bulkAdd(floors);
            await localDb.restaurantTables.bulkAdd(tables);
        });

        console.log("Menu sync complete.");
        return true;
    } catch (error) {
        console.error("Menu sync failed:", error);
        return false;
    }
};
