import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import CreateInvoice from './CreateInvoice';
import PrintReceipt from '../components/PrintReceipt';

export default function BillingDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total_paid: 0, total_unpaid: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // Printing state
  const [printInvoice, setPrintInvoice] = useState(null);
  const printRef = useRef(null);

  // Filters
  const [dateRange, setDateRange] = useState('Custom');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!showCreate) {
      fetchData();
    }
  }, [showCreate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await client.get('/billing/invoices');
      setInvoices(res.data?.data || res.data || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = () => {
    setShowCreate(true);
  };

  const handlePrint = async (invoiceId) => {
    try {
      // Fetch full invoice details including items
      const res = await client.get(`/billing/invoices/${invoiceId}`);
      setPrintInvoice(res.data);
      
      // Wait for React to render the hidden PrintReceipt component with the data
      setTimeout(() => {
        window.print();
        // Clear it after printing so it doesn't linger in DOM unnecessarily
        setTimeout(() => setPrintInvoice(null), 1000); 
      }, 100);
    } catch (err) {
      console.error('Failed to fetch invoice for printing', err);
      alert('Error loading receipt data for printing');
    }
  };

  const formatMoney = (amt) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (showCreate) {
    return <CreateInvoice onBack={() => setShowCreate(false)} />;
  }

  return (
    <div className="page active" id="p-billing-dashboard" style={{ padding: '0', background: '#F4F6F8' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ti ti-file-invoice"></i> Billing & Transactions
        </h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn" 
            style={{ background: '#FFE4E6', color: '#E11D48', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}
            onClick={handleAddSale}
          >
            <i className="ti ti-plus"></i> Add Sale
          </button>
          <button 
            className="btn" 
            style={{ background: '#E0F2FE', color: '#0284C7', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="ti ti-plus"></i> Add Purchase
          </button>
          <button 
            className="btn btn-outline" 
            style={{ borderRadius: '20px', color: '#0284C7', borderColor: '#E0F2FE', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="ti ti-plus"></i> Add More
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Filters & Summary Cards */}
        <div className="card" style={{ padding: '24px', borderRadius: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff' }}>
              <option value="Custom">Custom</option>
              <option value="Today">Today</option>
              <option value="This Month">This Month</option>
            </select>
            
            <div style={{ display: 'flex', alignItems: 'center', background: '#F1F3F5', borderRadius: '4px', padding: '4px' }}>
              <span style={{ fontSize: '12px', padding: '0 8px', color: '#666', fontWeight: 500 }}>Between</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', background: '#fff', padding: '4px 8px', borderRadius: '4px' }} />
              <span style={{ padding: '0 8px', color: '#666' }}>To</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', background: '#fff', padding: '4px 8px', borderRadius: '4px' }} />
            </div>

            <select style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff' }}>
              <option>ALL FIRMS</option>
              <option>Firm A</option>
            </select>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
              <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px' }}><i className="ti ti-chart-bar"></i> Graph</button>
              <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px' }}><i className="ti ti-file-spreadsheet"></i> Excel Report</button>
              <button className="btn btn-outline btn-sm" style={{ padding: '6px 12px' }}><i className="ti ti-printer"></i> Print</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1, background: '#D1FAE5', padding: '24px', borderRadius: '12px', color: '#065F46', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 500 }}>Paid</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatMoney(stats.total_paid)}</div>
            </div>
            <div style={{ fontSize: '24px', color: '#666' }}>+</div>
            <div style={{ flex: 1, background: '#DBEAFE', padding: '24px', borderRadius: '12px', color: '#1E40AF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 500 }}>Unpaid</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatMoney(stats.total_unpaid)}</div>
            </div>
            <div style={{ fontSize: '24px', color: '#666' }}>=</div>
            <div style={{ flex: 1, background: '#FDE68A', padding: '24px', borderRadius: '12px', color: '#92400E', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 500 }}>Total</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatMoney(stats.total_revenue)}</div>
            </div>
          </div>
          
        </div>

        {/* Transactions Table */}
        <div className="card" style={{ padding: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>TRANSACTIONS</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '4px', padding: '6px 12px', border: '1px solid var(--border)', width: '250px' }}>
                <i className="ti ti-search" style={{ color: '#888', marginRight: '8px' }}></i>
                <input type="text" placeholder="Search..." style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }} />
              </div>
              <button className="btn btn-blue btn-sm" onClick={handleAddSale} style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer' }}>
                <i className="ti ti-plus"></i> Add Sale
              </button>
            </div>
          </div>
          

          <div className="tbl-wrap" style={{ padding: '0' }}>
            <table style={{ width: '100%', margin: 0 }}>
              <thead>
                <tr style={{ color: '#888', fontSize: '12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 24px' }}>DATE <i className="ti ti-filter"></i></th>
                  <th>INVOICE NO. <i className="ti ti-filter"></i></th>
                  <th>PARTY NAME <i className="ti ti-filter"></i></th>
                  <th>TRANSACTION <i className="ti ti-filter"></i></th>
                  <th>PAYMENT TYPE <i className="ti ti-filter"></i></th>
                  <th style={{ textAlign: 'right' }}>AMOUNT <i className="ti ti-filter"></i></th>
                  <th style={{ textAlign: 'right' }}>BALANCE DUE <i className="ti ti-filter"></i></th>
                  <th style={{ paddingLeft: '24px' }}>STATUS</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading transactions...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No transactions found.</td></tr>
                ) : invoices.map((inv) => {
                  const amt = parseFloat(inv.grand_total) || parseFloat(inv.amount) || 0;
                  const bal = inv.status === 'Paid' ? 0 : amt;
                  const isUnpaid = inv.status !== 'Paid';
                  
                  return (
                    <tr key={inv.id} style={{ background: isUnpaid ? '#F0F9FF' : '#fff', borderBottom: '1px solid #f1f3f5' }}>
                      <td style={{ padding: '16px 24px' }}>{formatDate(inv.invoice_date || inv.created_at)}</td>
                      <td>{inv.invoice_number}</td>
                      <td style={{ fontWeight: 500 }}>{inv.customer_name || 'N/A'}</td>
                      <td>Sale</td>
                      <td>{inv.linked_payment || inv.sale_type || 'Cash'}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(amt).replace('₹', '')}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(bal).replace('₹', '')}</td>
                      <td style={{ color: isUnpaid ? '#0284C7' : '#10B981', fontWeight: 600, paddingLeft: '24px' }}>{isUnpaid ? 'Unpaid' : 'Paid'}</td>
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <i className="ti ti-printer" onClick={() => handlePrint(inv.id)} style={{ cursor: 'pointer', marginRight: '16px', color: '#666', fontSize: '18px' }} title="Print Receipt"></i>
                        <i className="ti ti-dots-vertical" style={{ cursor: 'pointer', color: '#666', fontSize: '18px' }}></i>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Hidden Print Component */}
      <PrintReceipt invoice={printInvoice} innerRef={printRef} />
    </div>
  );
}
