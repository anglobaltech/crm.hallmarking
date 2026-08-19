import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function DailyReport() {
  const dateStr = new Date().toISOString().split('T')[0];

  const [stats, setStats] = useState({
    articlesReceived: 0,
    huidTagged: 0,
    goldReceived: '0',
    revenue: '₹0'
  });

  const [weeklyGold, setWeeklyGold] = useState([]);
  const [purityDist, setPurityDist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [articlesRes, billingRes] = await Promise.all([
        client.get('/workflow/articles'),
        client.get('/billing/invoices')
      ]);
      
      const articles = articlesRes.data?.data || [];
      const bills = Array.isArray(billingRes.data) ? billingRes.data : (billingRes.data?.data || []);
      
      const huidArticles = articles.filter(a => a.huid);
      const totalGold = articles.reduce((acc, a) => acc + parseFloat(a.gross_weight || 0), 0);
      const totalRevenue = bills.reduce((acc, b) => acc + parseFloat(b.total_amount || 0), 0);
      
      setStats({
        articlesReceived: articles.length,
        huidTagged: huidArticles.length,
        goldReceived: totalGold.toFixed(1),
        revenue: `₹${totalRevenue.toFixed(0)}`
      });

      // Dummy stats for charts since we don't have historical data yet
      setWeeklyGold([
        { day: 'Mon', weight: '872g', percent: 72 },
        { day: 'Tue', weight: '1024g', percent: 85 },
        { day: 'Wed', weight: '820g', percent: 68 },
        { day: 'Thu', weight: '1098g', percent: 91 },
        { day: 'Today', weight: `${totalGold.toFixed(0)}g`, percent: Math.min(100, (totalGold/1500)*100) }
      ]);

      setPurityDist([
        { label: '22K/916', percent: 62, color: '#C9960C' },
        { label: '18K/750', percent: 28, color: 'var(--blue)' },
        { label: '14K/585', percent: 10, color: 'var(--green)' }
      ]);

    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="page active" id="p-dailyreport">
      <div className="page-title">
        <i className="ti ti-report"></i> Daily Report Management
        <button className="btn btn-outline btn-sm" onClick={fetchReports} style={{marginLeft: 'auto'}}>
          <i className="ti ti-refresh"></i> Refresh
        </button>
      </div>
      
      <div className="stats-row">
        <div className="stat-tile gold"><div className="lbl">Articles Received</div><div className="val">{stats.articlesReceived}</div></div>
        <div className="stat-tile green"><div className="lbl">HUID Tagged</div><div className="val">{stats.huidTagged}</div></div>
        <div className="stat-tile blue"><div className="lbl">Gold (grams)</div><div className="val">{stats.goldReceived}</div></div>
        <div className="stat-tile"><div className="lbl">Revenue</div><div className="val">{stats.revenue}</div></div>
      </div>
      
      <div className="two-col">
        <div className="card">
          <div className="card-header"><div className="card-title">This Week — Gold Processed (g)</div></div>
          {weeklyGold.map((item, idx) => (
            <div className="bar-row" key={idx}>
              <div className="bar-label">{item.day}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${item.percent}%`, background: 'var(--gold)' }}></div>
              </div>
              <div className="bar-val">{item.weight}</div>
            </div>
          ))}
          
          <div className="divider"></div>
          
          <div className="card-header" style={{ margin: 0 }}><div className="card-title">Purity Distribution</div></div>
          {purityDist.map((item, idx) => (
            <div className="bar-row" key={idx}>
              <div className="bar-label">{item.label}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${item.percent}%`, background: item.color }}></div>
              </div>
              <div className="bar-val">{item.percent}%</div>
            </div>
          ))}
        </div>
        
        <div className="card">
          <div className="card-header"><div className="card-title">Upload to BIS Portal</div></div>
          <div className="form-group"><label>Report Date</label><input type="date" id="reportDate" defaultValue={dateStr} /></div>
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Report Type</label>
            <select><option>Daily Summary</option><option>Weekly Report</option><option>Monthly Statement</option></select>
          </div>
          
          <div className="alert alert-success" style={{ marginTop: '12px' }}>
            <i className="ti ti-check"></i> Yesterday's report uploaded successfully to BIS Portal at 23:58.
          </div>
          
          <div className="btn-row" style={{ marginTop: '8px' }}>
            <button className="btn btn-gold"><i className="ti ti-upload"></i> Upload Today's Report</button>
          </div>
          
          <div className="divider"></div>
          
          <div className="card-title" style={{ marginBottom: '10px' }}>Export</div>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-outline btn-sm"><i className="ti ti-file-excel"></i> Excel</button>
            <button className="btn btn-outline btn-sm"><i className="ti ti-file-pdf"></i> PDF</button>
            <button className="btn btn-outline btn-sm"><i className="ti ti-printer"></i> Print</button>
          </div>
        </div>
      </div>
    </div>
  );
}
