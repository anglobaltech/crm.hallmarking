import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function Dashboard() {
  const navigateTo = (page) => {
    console.log(`Navigate to ${page}`);
  };

  const [stats, setStats] = useState({
    articlesToday: 0,
    articlesDiff: 'from yesterday',
    huidTagged: 0,
    huidPercent: 'completion',
    goldReceived: '0',
    goldSub: 'Net weight today',
    pendingQc: 0,
    pendingUrgent: 'urgent'
  });

  const [processFlow, setProcessFlow] = useState([
    { id: 'intake', step: 1, label: 'Intake', status: 'done', text: '0 done', page: 'intake' },
    { id: 'weightcheck', step: 2, label: 'Weighing', status: 'done', text: '0 done', page: 'weightcheck' },
    { id: 'imageauto', step: 3, label: 'Imaging', status: 'done', text: '0 done', page: 'imageauto' },
    { id: 'xrf', step: 4, label: 'XRF Test', status: 'active-step', text: '0', page: 'xrf' },
    { id: 'huidentry', step: 5, label: 'HUID Tag', status: 'pending', text: '0', page: 'huidentry' },
    { id: 'delivery', step: 6, label: 'Delivery', status: 'pending', text: '0', page: 'delivery' }
  ]);

  const [recentArticles, setRecentArticles] = useState([]);
  const [purityData, setPurityData] = useState([
    { label: '916 / 22K', percent: 0, color: 'var(--gold)' },
    { label: '750 / 18K', percent: 0, color: 'var(--blue)' },
    { label: '585 / 14K', percent: 0, color: 'var(--green)' }
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await client.get('/dashboard/stats');
        const data = res.data;
        
        // Map the backend data to our UI state
        setStats({
          articlesToday: data.total_articles || 0,
          articlesDiff: 'From all time',
          huidTagged: data.total_laser_jobs || 0,
          huidPercent: 'Jobs Completed',
          goldReceived: data.total_xrf_tests || 0,
          goldSub: 'XRF Tests Done',
          pendingQc: data.total_soldering || 0,
          pendingUrgent: 'Repairs pending'
        });

        // We can fetch real recent articles from /customer endpoint
        const custRes = await client.get('/customer');
        if (custRes.data?.data) {
          const recent = custRes.data.data.slice(0, 4).map(j => ({
            id: j.id,
            type: 'Jeweller Profile',
            weight: j.bis_license || 'N/A',
            status: j.total_articles > 0 ? 'Active' : 'New',
            badgeClass: j.total_articles > 0 ? 'badge-green' : 'badge-amber'
          }));
          setRecentArticles(recent);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="page active" id="p-dashboard">
      <div className="page-title"><i className="ti ti-layout-dashboard"></i> Centre Dashboard</div>
      
      <div className="alert alert-warning">
        <i className="ti ti-clock"></i> 
        <b>Calibration Due:</b> XRF Machine #002 — due in 3 days. 
        <span 
          style={{ marginLeft: 'auto', cursor: 'pointer', textDecoration: 'underline' }} 
          onClick={() => navigateTo('reminders')}
        >
          Manage →
        </span>
      </div>
      
      <div className="stats-row">
        <div className="stat-tile gold"><div className="lbl">Total Articles</div><div className="val">{stats.articlesToday}</div><div className="sub">{stats.articlesDiff}</div></div>
        <div className="stat-tile green"><div className="lbl">Laser Jobs</div><div className="val">{stats.huidTagged}</div><div className="sub">{stats.huidPercent}</div></div>
        <div className="stat-tile blue"><div className="lbl">XRF Tests</div><div className="val">{stats.goldReceived}</div><div className="sub">{stats.goldSub}</div></div>
        <div className="stat-tile red"><div className="lbl">Soldering/Repairs</div><div className="val">{stats.pendingQc}</div><div className="sub">{stats.pendingUrgent}</div></div>
      </div>

      <div className="section-title">Today's Process Flow</div>
      <div className="flow">
        {processFlow.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className={`flow-step ${step.status}`} onClick={() => navigateTo(step.page)}>
              <div className="num">{step.step}</div>
              <div className="lbl">{step.label}</div>
              <div className="text-sm">{step.text}</div>
            </div>
            {idx < processFlow.length - 1 && <div className="flow-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Profiles</div><button className="btn btn-outline btn-sm" onClick={() => navigateTo('articles')}>View All</button></div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Type</th><th>License</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentArticles.map(article => (
                  <tr key={article.id}>
                    <td className="text-gold">{article.id}</td>
                    <td>{article.type}</td>
                    <td>{article.weight}</td>
                    <td><span className={`badge ${article.badgeClass}`}>{article.status}</span></td>
                  </tr>
                ))}
                {recentArticles.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No recent data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><div className="card-title">Daily Gold (grams)</div></div>
          <div id="weekChart"></div>
          <div className="section-title" style={{ marginTop: '14px' }}>Purity Breakdown (Placeholder)</div>
          {purityData.map((item, idx) => (
            <div className="bar-row" key={idx}>
              <div className="bar-label">{item.label}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${item.percent}%`, background: item.color }}></div>
              </div>
              <div className="bar-val">{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
