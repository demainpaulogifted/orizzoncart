export function buildReceiptHtml(o: any): string {
  const items = (o.order_items || [])
    .map((i: any) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name} × ${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₦${Number(i.total_price).toLocaleString()}</td></tr>`)
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt ${o.order_number}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f7;padding:24px">
<div style="max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
<div style="background:#7c3aed;color:#fff;padding:24px;text-align:center">
<h1 style="margin:0;font-size:22px">🧾 Official Receipt</h1>
<p style="margin:6px 0 0;opacity:.9;font-size:13px">${o.store_name || o.merchants?.store_name || 'OrizzonCart Store'} • ${new Date(o.created_at).toLocaleString()}</p>
</div>
<div style="padding:24px">
<p style="text-align:center;font-size:30px;font-weight:800;margin:0 0 16px">₦${Number(o.total_amount).toLocaleString()}</p>
<table style="width:100%;font-size:14px;border-collapse:collapse">
<tr><td style="padding:6px 8px;color:#666">Order Number</td><td style="padding:6px 8px;text-align:right;font-weight:700">${o.order_number}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Tracking Number</td><td style="padding:6px 8px;text-align:right;font-weight:700">${o.tracking_number}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Customer</td><td style="padding:6px 8px;text-align:right;font-weight:700">${o.customer_name}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Payment</td><td style="padding:6px 8px;text-align:right;font-weight:700;color:#16a34a">${(o.payment_status || '').toUpperCase()}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Order Status</td><td style="padding:6px 8px;text-align:right;font-weight:700">${(o.status || '').toUpperCase()}</td></tr>
</table>
<h3 style="margin:20px 0 8px;font-size:14px">Items</h3>
<table style="width:100%;font-size:14px;border-collapse:collapse">${items}</table>
<table style="width:100%;font-size:14px;margin-top:12px">
<tr><td style="padding:4px 8px;color:#666">Subtotal</td><td style="text-align:right">₦${Number(o.subtotal).toLocaleString()}</td></tr>
<tr><td style="padding:4px 8px;color:#666">Shipping</td><td style="text-align:right">₦${Number(o.shipping_cost).toLocaleString()}</td></tr>
<tr><td style="padding:4px 8px;font-weight:800">Total</td><td style="text-align:right;font-weight:800">₦${Number(o.total_amount).toLocaleString()}</td></tr>
</table>
<p style="margin-top:20px;font-size:11px;color:#999;text-align:center">Powered by OrizzonCart • OrizzonS Inc.</p>
</div></div></body></html>`;
}

export function downloadReceipt(o: any) {
  try {
    const blob = new Blob([buildReceiptHtml(o)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${o.order_number}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {}
}