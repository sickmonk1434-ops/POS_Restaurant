import { LocalBill } from "@/lib/dexie";
import { RECEIPT_CONFIG } from "@/lib/receipt-config";

interface BillReceiptProps {
  bill: LocalBill;
  tableNumber: string;
  cashierName: string;
}

export function BillReceipt({ bill, tableNumber, cashierName }: BillReceiptProps) {
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

  const paymentMode =
    bill.payments && bill.payments.length > 0
      ? bill.payments.map((p) => p.method.toUpperCase()).join(", ")
      : "Cash";

  const separator = "--------------------------------";

  return (
    <div id="bill-receipt" className="hidden print:block">
      <div className="receipt">
        {/* Header */}
        <div className="text-center">
          <div className="font-bold text-lg">{RECEIPT_CONFIG.restaurantName}</div>
          <div>{RECEIPT_CONFIG.address}</div>
          <div>Phone: {RECEIPT_CONFIG.phone}</div>
        </div>

        <div className="separator">{separator}</div>

        {/* Bill Info */}
        <div className="bill-info">
          <div className="row">
            <span>Bill No: {bill.id?.slice(-5).toUpperCase()}</span>
            <span>Date: {dateStr}</span>
          </div>
          <div className="row">
            <span>Time: {timeStr}</span>
            <span>Table: {tableNumber}</span>
          </div>
          <div className="row">
            <span>Cashier: {cashierName}</span>
            <span>Type: {bill.orderType === "dine-in" ? "Dine-in" : "Takeaway"}</span>
          </div>
        </div>

        <div className="separator">{separator}</div>

        {/* Items Header */}
        <div className="items-header">
          <span className="item-name">Item</span>
          <span className="item-qty">Qty</span>
          <span className="item-rate">Rate</span>
          <span className="item-amount">Amount</span>
        </div>

        <div className="separator">{separator}</div>

        {/* Items */}
        <div className="items">
          {bill.items.map((item) => (
            <div key={item.id} className="item-row">
              <span className="item-name">{item.name}</span>
              <span className="item-qty">{item.quantity}</span>
              <span className="item-rate">{item.price}</span>
              <span className="item-amount">{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="separator">{separator}</div>

        {/* Total */}
        <div className="total-row">
          <span>Total:</span>
          <span>{bill.total}</span>
        </div>

        <div>Payment Mode: {paymentMode}</div>

        <div className="separator">{separator}</div>

        {/* Footer */}
        <div className="text-center footer">Thank You! Visit Again!</div>
      </div>
    </div>
  );
}
