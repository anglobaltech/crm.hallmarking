import React, { useState, useEffect } from 'react';
import { toast } from './Toast';
import client from '../api/client';

export default function ServiceForm({ title, icon, onSubmit, loading, extraFields, endpoint }) {
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [metal, setMetal] = useState('Gold');
  const [purity, setPurity] = useState('916 (22K)');
  const [gstNumber, setGstNumber] = useState('');
  
  const [recentJobs, setRecentJobs] = useState([]);

  const fetchJobs = async () => {
    if (!endpoint) return;
    try {
      const res = await client.get(endpoint);
      setRecentJobs(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching recent jobs:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [endpoint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !weight) {
      toast('Customer Name and Weight are required.', 'error');
      return;
    }
    
    const data = {
      jeweller_name: customerName,
      phone: mobile,
      address,
      weight: parseFloat(weight),
      gross_weight: parseFloat(weight), // Send both to satisfy different controllers
      sample_weight: parseFloat(weight), // For fire assay
      material: metal,
      article_type: 'Service Article', // Default to avoid NOT NULL constraints
      metal,
      gold_type: metal, // For gold exchange
      purity,
      declared_purity: purity, // For fire assay
      gst_number: gstNumber,
      gstin: gstNumber, // For gold exchange
      ...extraFields
    };
    
    const result = onSubmit(data);
    if (result && typeof result.then === 'function') {
      await result;
      fetchJobs();
    } else {
      setTimeout(fetchJobs, 1000);
    }
    
    // Clear form
    setCustomerName('');
    setMobile('');
    setAddress('');
    setWeight('');
    setGstNumber('');
  };

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title" style={{ marginBottom: '14px' }}>
          <i className={`ti ${icon}`}></i> {title} Intake
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name *</label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name" />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile" />
            </div>
            <div className="form-group full">
              <label>Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Customer address..."></textarea>
            </div>
            
            <div className="form-group">
              <label>Weight before {title.toLowerCase()} (g) *</label>
              <input type="number" step="0.001" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.000" />
            </div>
            
            <div className="form-group">
              <label>Metal Type</label>
              <select value={metal} onChange={e => setMetal(e.target.value)}>
                <option>Gold</option>
                <option>Silver</option>
              </select>
            </div>
            <div className="form-group">
              <label>Purity</label>
              <select value={purity} onChange={e => setPurity(e.target.value)}>
                <option>999 (24K)</option>
                <option>916 (22K)</option>
                <option>833 (20K)</option>
                <option>750 (18K)</option>
                <option>666 (16K)</option>
                <option>585 (14K)</option>
                <option>375 (9K)</option>
              </select>
            </div>
            <div className="form-group">
              <label>GST Number (Optional)</label>
              <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" />
            </div>
          </div>
          
          <div className="btn-row" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              <i className="ti ti-check"></i> {loading ? 'Saving...' : 'Save & Add'}
            </button>
          </div>
        </form>
      </div>
      
      {endpoint && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending {title}</div>
            <span className="badge badge-amber">{recentJobs.length}</span>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Weight (g)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>{item.jeweller_name}</td>
                    <td>{item.weight || item.gross_weight || item.sample_weight || 'N/A'}</td>
                    <td className="text-sm">{new Date(item.created_at || new Date()).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {recentJobs.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign: 'center'}}>No pending items.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
