import { BillItem } from "../dexie";

export const simulateKOTPrint = async (tableNumber: string, items: BillItem[]) => {
    console.log("--- KOT PRINTING ---");
    console.log(`Table: ${tableNumber}`);
    console.log(`Time: ${new Date().toLocaleTimeString()}`);
    console.log("Items:");
    items.forEach(item => {
        console.log(`- ${item.name} x ${item.quantity}`);
    });
    console.log("--------------------");

    // In a real scenario, this would use a browser printing library or a web socket to a printer
    return true;
};
