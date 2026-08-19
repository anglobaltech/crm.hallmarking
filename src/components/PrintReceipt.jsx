import React from 'react';

export default function PrintReceipt({ invoice, innerRef }) {
  if (!invoice) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMoney = (amt) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);
  };

  return (
    <div ref={innerRef} className="print-receipt-container">
      <style>
        {`
          .print-receipt-container {
            display: none;
          }
          
          @media print {
            /* Hide all app shells */
            #sidebar, .desk-nav, header, nav, .top-bar, .toast-container {
              display: none !important;
            }
            /* Make layout wrappers visible and unrestrained */
            body, html, #root, #main, #content, .page {
              display: block !important;
              height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            /* Hide all direct children of the page except our print container */
            .page > div:not(.print-receipt-container) {
              display: none !important;
            }
            
            /* Show our print container */
            .print-receipt-container {
              display: block !important;
              width: 100%;
              background: white;
              font-family: 'Inter', sans-serif;
              color: #000;
              margin: 0 auto;
              padding: 20px;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 24px;
              border-bottom: 2px dashed #ccc;
              padding-bottom: 16px;
            }
            .receipt-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .receipt-header p {
              margin: 4px 0 0 0;
              font-size: 14px;
              color: #444;
            }
            .receipt-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              font-size: 14px;
            }
            .receipt-details strong {
              display: block;
              margin-bottom: 4px;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 14px;
            }
            .receipt-table th {
              text-align: left;
              padding: 8px 4px;
              border-bottom: 2px solid #000;
            }
            .receipt-table td {
              padding: 8px 4px;
              border-bottom: 1px dashed #ccc;
            }
            .receipt-totals {
              width: 300px;
              margin-left: auto;
              font-size: 14px;
            }
            .receipt-totals-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }
            .receipt-totals-row.grand-total {
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 40px;
              font-size: 12px;
              color: #666;
              border-top: 2px dashed #ccc;
              padding-top: 16px;
            }
          }
        `}
      </style>

      <div className="receipt-header">
        <h1>TAX INVOICE</h1>
        <p>Your Company Name Here</p>
        <p>123 Business Road, City, State, ZIP</p>
        <p>GSTIN: 27AAAAA0000A1Z5</p>
      </div>

      <div className="receipt-details">
        <div>
          <strong>Billed To:</strong>
          <div>{invoice.customer_name || 'Walk-in Customer'}</div>
          {invoice.customer_phone && <div>{invoice.customer_phone}</div>}
          {invoice.billing_address && <div>{invoice.billing_address}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong>Invoice Details:</strong>
          <div>No: {invoice.invoice_number}</div>
          <div>Date: {formatDate(invoice.invoice_date || invoice.created_at)}</div>
          <div>Status: {invoice.status}</div>
          <div>Payment: {invoice.linked_payment || invoice.sale_type || 'Cash'}</div>
        </div>
      </div>

      <table className="receipt-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Rate</th>
            <th style={{ textAlign: 'right' }}>Tax</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td>{idx + 1}</td>
                <td>{item.item_name}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(item.price_per_unit)}</td>
                <td style={{ textAlign: 'right' }}>{item.tax_rate}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(item.amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', fontStyle: 'italic', padding: '16px' }}>
                Summary Sale (Item details not available)
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="receipt-totals">
        <div className="receipt-totals-row">
          <span>Subtotal:</span>
          <span>{formatMoney(invoice.subtotal)}</span>
        </div>
        {parseFloat(invoice.total_discount) > 0 && (
          <div className="receipt-totals-row">
            <span>Discount:</span>
            <span>-{formatMoney(invoice.total_discount)}</span>
          </div>
        )}
        <div className="receipt-totals-row">
          <span>Tax:</span>
          <span>+{formatMoney(invoice.total_tax)}</span>
        </div>
        {parseFloat(invoice.round_off) !== 0 && (
          <div className="receipt-totals-row">
            <span>Round Off:</span>
            <span>{invoice.round_off > 0 ? '+' : ''}{invoice.round_off}</span>
          </div>
        )}
        <div className="receipt-totals-row grand-total">
          <span>Grand Total:</span>
          <span>{formatMoney(invoice.grand_total || invoice.amount)}</span>
        </div>
      </div>

      <div className="receipt-footer">
        {invoice.description && (
          <div style={{ marginBottom: '16px', textAlign: 'left', fontStyle: 'italic' }}>
            <strong>Remarks: </strong> {invoice.description}
          </div>
        )}
        <p>Thank you for your business!</p>
        <p>This is a computer generated invoice.</p>
      </div>
    </div>
  );
}
