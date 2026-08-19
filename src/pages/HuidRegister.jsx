import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function HuidRegister() {
  const [register, setRegister] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRegister = async () => {
    setLoading(true);
    try {
      const res = await client.get('/workflow/articles');
      const huidArticles = res.data?.data?.filter(a => a.huid) || [];
      setRegister(huidArticles);
    } catch (err) {
      console.error('Failed to fetch HUID register:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, []);

  return (
    <div className="page active" id="p-huidregister">
      <div className="page-title">
        <i className="ti ti-database"></i> HUID Register
        <button className="btn btn-outline btn-sm" onClick={fetchRegister} style={{marginLeft: 'auto'}}>
          <i className="ti ti-refresh"></i> Refresh
        </button>
      </div>
      
      <div className="search-box">
        <i className="ti ti-search"></i>
        <input type="text" placeholder="Search by HUID, Article ID, Customer name..." />
      </div>
      
      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>HUID</th><th>Article ID</th><th>Customer</th><th>Type</th><th>Purity</th><th>Weight</th><th>Date</th><th>Certificate</th></tr>
            </thead>
            <tbody>
              {register.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--blue)' }}>{item.huid}</td>
                  <td className="text-gold">{item.article_code}</td>
                  <td>{item.customer_name}</td>
                  <td>{item.article_type}</td>
                  <td><span className="badge badge-gold">{item.declared_purity || 'N/A'}</span></td>
                  <td>{item.gross_weight || 'N/A'}g</td>
                  <td className="text-sm">{new Date(item.updated_at).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</td>
                  <td><button className="btn btn-outline btn-sm"><i className="ti ti-download"></i> PDF</button></td>
                </tr>
              ))}
              {register.length === 0 && !loading && (
                <tr><td colSpan="8" style={{textAlign: 'center'}}>No HUIDs registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
        <button className="btn btn-outline btn-sm"><i className="ti ti-file-export"></i> Export All</button>
        <button className="btn btn-blue btn-sm"><i className="ti ti-external-link"></i> Verify on BIS Portal</button>
      </div>
    </div>
  );
}
