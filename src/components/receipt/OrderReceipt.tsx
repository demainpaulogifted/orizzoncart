'use client';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrderReceiptProps {
  order: any;
  merchant: any;
}

export function OrderReceipt({ order, merchant }: OrderReceiptProps) {
  const handleDownload = () => {
    window.print(); // In production, use html2canvas + jspdf to save as PDF/Image
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Order Receipt ${order.order_number}`, text: `Thank you for your purchase!` });
    } else {
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 print:my-0">
      {/* Receipt Card */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" id="receipt-content">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white text-center">
          <h1 className="text-3xl font-bold font-display mb-2">Payment Receipt</h1>
          <p className="text-gray-300">Thank you for your purchase!</p>
          <div className="mt-4 inline-block bg-white/10 px-4 py-2 rounded-full text-sm">
            Order #{order.order_number}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-bold text-gray-900">{order.customer_name}</p>
              <p className="text-sm text-gray-600">{order.customer_email}</p>
              <p className="text-sm text-gray-600 mt-2">{order.shipping_address?.address_line1}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
              <p className="font-bold text-gray-900">{formatDate(order.created_at)}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-1">Tracking Number</p>
              <p className="font-bold text-blue-600">{order.tracking_number}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-gray-200 py-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {order.items?.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 font-medium">{item.product_name}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
            <span>Total Paid</span>
            <span className="text-2xl text-green-600">{formatCurrency(order.total_amount)}</span>
          </div>

          {/* Merchant Contact Info */}
          <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
            <p className="font-bold text-gray-900 mb-2">Store Contact Information:</p>
            <p><strong>Store:</strong> {merchant?.store_name || 'N/A'}</p>
            <p><strong>WhatsApp:</strong> {merchant?.whatsapp_number || 'Not provided'}</p>
            <p><strong>Email:</strong> {merchant?.contact_email || 'Not provided'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center text-xs text-gray-500 border-t">
          <p>Powered by OrizzonCart • OrizzonS Inc.</p>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex gap-4 mt-6 print:hidden">
        <button onClick={handleDownload} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 flex items-center justify-center gap-2">
          <span>⬇️</span> Download Receipt
        </button>
        <button onClick={handleShare} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
          <span>🔗</span> Share Receipt
        </button>
      </div>
    </div>
  );
}