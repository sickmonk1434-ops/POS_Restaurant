import { BillItem } from "@/lib/dexie";
import { RECEIPT_CONFIG } from "@/lib/receipt-config";

interface KOTReceiptProps {
  tableNumber: string;
  items: BillItem[];
}

export function KOTReceipt({ tableNumber, items }: KOTReceiptProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const separator = "--------------------------------";

  return (
    <div id="kot-receipt" className="hidden print:block">
      <div className="receipt">
        <div className="text-center font-bold text-xl">KOT</div>
        <div className="text-center">{RECEIPT_CONFIG.restaurantName}</div>
        
        <div className="separator">{separator}</div>
        
        <div className="bill-info">
          <div className="row">
            <span className="font-bold text-lg">Table: {tableNumber}</span>
          </div>
          <div className="row">
            <span>Date: {dateStr}</span>
            <span>{timeStr}</span>
          </div>
        </div>

        <div className="separator">{separator}</div>

        <div className="items-header">
          <span className="item-name font-bold">Item Name</span>
          <span className="item-qty font-bold">Qty</span>
        </div>

        <div className="separator">{separator}</div>

        <div className="items">
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <span className="item-name text-lg font-bold">{item.name}</span>
              <span className="item-qty text-lg font-bold">{item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="separator">{separator}</div>
        
        <div className="text-center font-bold">*** KITCHEN COPY ***</div>
      </div>
    </div>
  );
}
