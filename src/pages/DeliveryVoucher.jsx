import React, { useState } from 'react';
import client from '../api/client';
import { toast } from '../components/Toast';

export default function DeliveryVoucher({ order, articles = [], onBack }) {
  const [loading, setLoading] = useState(false);
  
  const [huidsDone, setHuidsDone] = useState(0);
  const [rejected, setRejected] = useState(0);

  // Use props or fallback to mock data
  const customerName = order?.customer_name || 'Example Hallmarking Centre';
  const customerMobile = order?.customer_mobile || 'N/A';
  const receiptDate = order?.receipt_date ? new Date(order.receipt_date).toLocaleDateString() : new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page active" id="p-delivery-voucher">
      <div className="page-title">
        <i className="ti ti-file-invoice"></i> Delivery Voucher
        {onBack && (
          <button className="btn btn-outline btn-sm" onClick={onBack} style={{marginLeft: 'auto'}}>
            <i className="ti ti-arrow-left"></i> Back to List
          </button>
        )}
      </div>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 5px 0' }}>{customerName}</h2>
          <p style={{ margin: '0', color: 'var(--text2)' }}>Delivery Voucher</p>
        </div>
        <div className="divider"></div>

        {/* Form Details Summary (Mocked for now as we don't have global state for the order) */}
        <div className="card-title" style={{ marginBottom: '14px' }}>Order Details Summary</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer Mobile</label>
            <input type="text" value={customerMobile} readOnly />
          </div>
          <div className="form-group">
            <label>Order Date</label>
            <input type="text" value={receiptDate} readOnly />
          </div>
        </div>
        
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '20px', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px' }}>Type</th>
              <th style={{ padding: '8px' }}>Metal</th>
              <th style={{ padding: '8px' }}>Purity</th>
              <th style={{ padding: '8px' }}>Weight (g)</th>
              <th style={{ padding: '8px' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {articles.length > 0 ? (
              articles.map((art, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}>{art.article_type || art.type}</td>
                  <td style={{ padding: '8px' }}>{art.metal}</td>
                  <td style={{ padding: '8px' }}>{art.declared_purity || art.purity || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{art.gross_weight || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{art.quantity || 1}</td>
                </tr>
              ))
            ) : (
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px' }}>Ring</td>
                <td style={{ padding: '8px' }}>Gold</td>
                <td style={{ padding: '8px' }}>916 (22K)</td>
                <td style={{ padding: '8px' }}>15.500</td>
                <td style={{ padding: '8px' }}>2</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="divider"></div>

        {/* HUID & Rejection details */}
        <div className="card-title" style={{ marginBottom: '14px' }}>Processing Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Total number of article HUIDs done</label>
            <input type="number" min="0" value={huidsDone} onChange={e => setHuidsDone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Total number rejected</label>
            <input type="number" min="0" value={rejected} onChange={e => setRejected(e.target.value)} />
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: '20px' }}>
          <button className="btn btn-gold" onClick={handlePrint}>
            <i className="ti ti-printer"></i> Print Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
