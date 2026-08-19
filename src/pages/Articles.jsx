import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function Articles({ setPage }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await client.get('/workflow/articles');
      setArticles(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Intake': return 'badge-amber';
      case 'Weight Checked': return 'badge-amber';
      case 'In XRF': return 'badge-blue';
      case 'HUID Wait': return 'badge-amber';
      case 'Delivered': return 'badge-green';
      default: return 'badge-outline';
    }
  };

  return (
    <div className="page active" id="p-articles">
      <div className="page-title">
        <i className="ti ti-list-details"></i> Article Register
        <button className="btn btn-outline btn-sm" onClick={fetchArticles} style={{marginLeft: 'auto'}}>
          <i className="ti ti-refresh"></i> Refresh
        </button>
      </div>
      
      <div className="search-box">
        <i className="ti ti-search"></i>
        <input type="text" placeholder="Search by Article ID, Customer, HUID, Batch..." />
      </div>
      
      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Article ID</th><th>Customer</th><th>Type</th><th>Metal</th><th>Purity</th><th>Weight(g)</th><th>HUID</th><th>Status</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr key={article.id}>
                  <td className="text-gold">{article.article_code}</td>
                  <td>{article.customer_name}</td>
                  <td>{article.article_type}</td>
                  <td>{article.metal}</td>
                  <td>{article.declared_purity || 'N/A'}</td>
                  <td>{article.gross_weight || 'N/A'}</td>
                  <td>
                    {article.huid ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{article.huid}</span>
                    ) : (
                      <span className="badge badge-amber">Pending</span>
                    )}
                  </td>
                  <td><span className={`badge ${getStatusClass(article.status)}`}>{article.status}</span></td>
                  <td className="text-sm">{new Date(article.created_at).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</td>
                  <td>
                    {article.status === 'Intake' && <button className="btn btn-sm btn-blue" onClick={() => setPage('weightcheck')}>Check Wt</button>}
                    {article.status === 'HUID Wait' && <button className="btn btn-sm btn-blue" onClick={() => setPage('huidentry')}>Tag HUID</button>}
                    {article.status === 'Delivered' && <button className="btn btn-sm btn-outline">View</button>}
                    {!['Intake', 'HUID Wait', 'Delivered'].includes(article.status) && <button className="btn btn-sm btn-outline">Track</button>}
                  </td>
                </tr>
              ))}
              {articles.length === 0 && !loading && (
                <tr><td colSpan="10" style={{textAlign: 'center'}}>No articles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
        <button className="btn btn-outline btn-sm"><i className="ti ti-file-export"></i> Export CSV</button>
        <button className="btn btn-outline btn-sm"><i className="ti ti-printer"></i> Print Register</button>
      </div>
    </div>
  );
}
