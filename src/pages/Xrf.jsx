import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function Xrf() {
  const [artId, setArtId] = useState('');
  const [au, setAu] = useState('');
  const [result, setResult] = useState('Pass');
  const [xrfQueue, setXrfQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await client.get('/services/xrf');
      setXrfQueue(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch XRF queue:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const saveXRF = async () => {
    if (!artId) return alert('Please enter Article ID');
    
    setLoading(true);
    try {
      await client.post('/services/xrf', {
        sample_id: artId,
        jeweller_name: 'Walk-in Customer',
        article_type: 'Unknown',
        gold_pct: au || 0,
        result: result,
      });
      alert(`XRF Result saved!`);
      setArtId('');
      setAu('');
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert('Error saving XRF: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (page) => {
    console.log(`Navigate to ${page}`);
  };

  return (
    <div className="page active" id="p-xrf">
      <div className="page-title"><i className="ti ti-atom"></i> XRF Testing</div>
      
      <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: '12px' }}>XRF Test Entry</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Article ID *</label>
              <input type="text" placeholder="ART-2024-XXX" value={artId} onChange={e => setArtId(e.target.value)} />
            </div>
            <div className="form-group">
              <label>XRF Machine</label>
              <select><option>XRF-001 (Olympus Vanta)</option><option>XRF-002 (Bruker S1)</option></select>
            </div>
            <div className="form-group">
              <label>Au (Gold) %</label>
              <input type="number" placeholder="91.60" step="0.01" value={au} onChange={e => setAu(e.target.value)} />
            </div>
            <div className="form-group"><label>Ag (Silver) %</label><input type="number" placeholder="0.00" step="0.01" /></div>
            <div className="form-group"><label>Cu (Copper) %</label><input type="number" placeholder="0.00" step="0.01" /></div>
            <div className="form-group"><label>Zn (Zinc) %</label><input type="number" placeholder="0.00" step="0.01" /></div>
          </div>
          
          <div className="divider"></div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Test Result</label>
              <select value={result} onChange={e => setResult(e.target.value)}>
                <option value="Pass">PASS</option>
                <option value="Fail">FAIL</option>
                <option value="Retest">Retest</option>
              </select>
            </div>
            <div className="form-group">
              <label>Certified Purity</label>
              <select><option>916 (22K)</option><option>750 (18K)</option><option>585 (14K)</option><option>375 (9K)</option><option>999 (24K)</option></select>
            </div>
            <div className="form-group full">
              <label>Remarks</label>
              <textarea placeholder="Test observations..."></textarea>
            </div>
          </div>
          
          <div className="btn-row">
            <button className="btn btn-gold" onClick={saveXRF} disabled={loading}>
              <i className="ti ti-check"></i> {loading ? 'Saving...' : 'Save XRF Result'}
            </button>
            <button className="btn btn-outline"><i className="ti ti-file-export"></i> Import from Machine</button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">XRF Queue</div>
            <span className="badge badge-amber">{xrfQueue.length} pending</span>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Article</th><th>Gold %</th><th>Result</th></tr>
              </thead>
              <tbody>
                {xrfQueue.map((item, index) => (
                  <tr key={index}>
                    <td className="text-gold">{item.sample_id || item.id}</td>
                    <td>{item.gold_pct}%</td>
                    <td>
                      <span className={`badge ${item.result === 'Pass' ? 'badge-green' : 'badge-red'}`}>
                        {item.result}
                      </span>
                    </td>
                  </tr>
                ))}
                {xrfQueue.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No tests recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="divider"></div>
          
          <div className="alert alert-warning">
            <i className="ti ti-tool"></i> XRF-002 calibration due in <b>3 days</b>. 
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('reminders'); }} style={{ color: 'var(--amber)', marginLeft: 'auto' }}>Schedule →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
