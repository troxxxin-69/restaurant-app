import type { Order } from "../context/AppContext";

/**
 * Exports orders list to a 5-Star Executive Styled Excel Spreadsheet (.xls).
 * Includes company title header, summary cards, dark navy headers, color badges, and financial totals.
 */
export function exportOrdersToCsv(orders: Order[]) {
  if (!orders || orders.length === 0) return;

  const now = new Date();
  const generatedTimeStr = now.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const totalDeliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCancelledLoss = cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const tableHeaders = [
    "Order ID",
    "Date & Time",
    "Customer Name",
    "Customer Phone",
    "Location Mode",
    "Delivery Address",
    "Google Maps Link",
    "Items Summary",
    "Total Amount",
    "Payment Method",
    "Order Status",
    "Assigned Delivery Boy",
    "Delivery Boy Phone",
    "Cancellation Reason",
  ];

  const rowsHtml = orders
    .map((o, index) => {
      const formattedDate = new Date(o.date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const itemNames = o.items.map((i) => `${i.qty}x ${i.name} (₹${i.price * i.qty})`).join("; ");

      const mapsLink =
        o.google_maps_link ||
        String(o.address || "").match(/\[Google Maps Link:\s*([^\]]+)\]/i)?.[1] ||
        String(o.address || "").match(/(https:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|google\.com\/maps)[^\s()\]]+)/i)?.[1] ||
        (o.lat && o.lng ? `https://www.google.com/maps?q=${o.lat},${o.lng}` : "N/A");

      const modeBadge = o.google_maps_link
        ? "Shared Google Maps Link"
        : o.location_mode === "gps_device"
        ? "Device GPS Pin"
        : "Typed Address";

      let statusStyle = "background-color: #f1f5f9; color: #475569; font-weight: bold;";
      if (o.status === "delivered") {
        statusStyle = "background-color: #dcfce7; color: #15803d; font-weight: bold;";
      } else if (o.status === "cancelled") {
        statusStyle = "background-color: #fee2e2; color: #b91c1c; font-weight: bold;";
      } else if (o.status === "out_for_delivery" || o.status === "picked_up") {
        statusStyle = "background-color: #e0f2fe; color: #0369a1; font-weight: bold;";
      } else if (o.status === "preparing" || o.status === "ready_for_pickup") {
        statusStyle = "background-color: #fef3c7; color: #b45309; font-weight: bold;";
      }

      const rowBg = index % 2 === 0 ? "#ffffff" : "#f8fafc";

      return `<tr style="background-color: ${rowBg};">
        <td style="text-align: center; font-weight: bold;">#${o.id}</td>
        <td>${formattedDate}</td>
        <td><b>${o.customer_name || "Customer"}</b></td>
        <td style="mso-number-format:'\\@';">${o.phone || ""}</td>
        <td style="text-align: center;">${modeBadge}</td>
        <td>${o.street_address || o.address || ""}</td>
        <td>${mapsLink !== "N/A" ? `<a href="${mapsLink}" target="_blank">${mapsLink}</a>` : "N/A"}</td>
        <td>${itemNames}</td>
        <td style="text-align: right; font-weight: bold; color: #047857;">₹${o.total}</td>
        <td style="text-align: center;">${o.payment || "Cash On Delivery"}</td>
        <td style="text-align: center; ${statusStyle}">${String(o.status).toUpperCase().replace(/_/g, " ")}</td>
        <td>${o.delivery_boy_name || "N/A"}</td>
        <td style="mso-number-format:'\\@';">${o.delivery_boy_phone || "N/A"}</td>
        <td style="color: #b91c1c;">${o.cancellation_reason || "N/A"}</td>
      </tr>`;
    })
    .join("");

  const excelContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>MANAS Sales Report</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; }
  table { border-collapse: collapse; width: 100%; }
  th { background-color: #1e293b; color: #ffffff; font-weight: bold; font-size: 13px; text-align: center; border: 1px solid #475569; padding: 10px; }
  td { font-size: 12px; border: 1px solid #cbd5e1; padding: 8px; vertical-align: middle; }
  .title-card { background-color: #d97706; color: #ffffff; font-size: 20px; font-weight: bold; text-align: center; padding: 14px; }
  .subtitle-card { background-color: #0f172a; color: #94a3b8; font-size: 11px; font-weight: bold; text-align: center; padding: 6px; }
  .summary-label { background-color: #f1f5f9; font-weight: bold; font-size: 12px; }
  .summary-val { font-weight: bold; font-size: 13px; text-align: right; }
  .total-delivered { background-color: #059669; color: #ffffff; font-weight: bold; font-size: 13px; }
  .total-cancelled { background-color: #dc2626; color: #ffffff; font-weight: bold; font-size: 13px; }
</style>
</head>
<body>

<table>
  <tr>
    <td colspan="14" class="title-card">HOTEL MANAS — OFFICIAL EXECUTIVE SALES & REVENUE REPORT</td>
  </tr>
  <tr>
    <td colspan="14" class="subtitle-card">Report Generated On: ${generatedTimeStr} | Pure Vegetarian Restaurant & Resort Operations</td>
  </tr>
  <tr><td colspan="14" style="height: 10px; border: none;"></td></tr>
  
  <!-- METRICS SUMMARY BANNER -->
  <tr>
    <td colspan="3" class="summary-label">TOTAL ORDERS LOGGED:</td>
    <td colspan="2" class="summary-val">${orders.length} Orders</td>
    <td colspan="3" class="summary-label">COMPLETED DELIVERIES:</td>
    <td colspan="2" class="summary-val" style="color: #059669;">${deliveredOrders.length} Delivered</td>
    <td colspan="2" class="summary-label">CANCELLED ORDERS:</td>
    <td colspan="2" class="summary-val" style="color: #dc2626;">${cancelledOrders.length} Cancelled</td>
  </tr>
  <tr>
    <td colspan="3" class="total-delivered">NET REVENUE GENERATED (Delivered):</td>
    <td colspan="4" class="total-delivered" style="text-align: right; font-size: 15px;">₹${totalDeliveredRevenue.toLocaleString("en-IN")}</td>
    <td colspan="3" class="total-cancelled">CANCELLED LOSS AMOUNT:</td>
    <td colspan="4" class="total-cancelled" style="text-align: right; font-size: 15px;">₹${totalCancelledLoss.toLocaleString("en-IN")}</td>
  </tr>

  <tr><td colspan="14" style="height: 15px; border: none;"></td></tr>

  <!-- TABLE HEADERS -->
  <thead>
    <tr>
      ${tableHeaders.map((h) => `<th>${h}</th>`).join("")}
    </tr>
  </thead>

  <!-- DATA ROWS -->
  <tbody>
    ${rowsHtml}
  </tbody>

  <!-- FOOTER TOTALS -->
  <tfoot>
    <tr><td colspan="14" style="height: 15px; border: none;"></td></tr>
    <tr>
      <td colspan="8" style="background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 14px; text-align: right;">GRAND TOTAL NET REVENUE (Delivered Orders Only):</td>
      <td style="background-color: #059669; color: #ffffff; font-weight: bold; font-size: 16px; text-align: right;">₹${totalDeliveredRevenue.toLocaleString("en-IN")}</td>
      <td colspan="5" style="background-color: #0f172a; color: #94a3b8; font-size: 11px; text-align: center;">End of Official MANAS Sales Report</td>
    </tr>
  </tfoot>
</table>

</body>
</html>
`;

  const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MANAS_Executive_Sales_Report_${now.toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
