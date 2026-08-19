import React, { useState, useEffect, useRef } from 'react';

export default function TopBar({ setLocked, setPage }) {
  const [time, setTime] = useState('--:--:--');
  const [date, setDate] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div id="topbar">
      <div className="logo">
        <div className="logo-icon">⚜</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '.5px' }}>HUID Manager</div>
          <div style={{ fontSize: '10px', color: '#7AB', letterSpacing: '.5px' }}>Hallmarking Centre Suite</div>
        </div>
      </div>
      
      <div className="right">
        <div 
          className="lic-badge" 
          onClick={() => setPage('reminders')} 
          title="Licence Status"
        >
          ⚠ Licence: 42 days
        </div>
        
        <div className="clock" id="clock">
          {date} · {time}
        </div>
        
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => setShowNotifs(!showNotifs)} 
            style={{ borderColor: '#345', color: '#9AB', background: 'transparent' }}
          >
            <i className="ti ti-bell"></i> 
            <span id="notifCount" style={{ background: 'var(--red)', color: '#fff', borderRadius: '10px', padding: '0 5px', fontSize: '10px', marginLeft: '4px' }}>
              3
            </span>
          </button>
          
          <div className={`notif-panel ${showNotifs ? 'show' : ''}`} id="notifPanel">
            <div style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
              NOTIFICATIONS
            </div>
            <div className="notif-item">
              <div className="n-title"><span className="notif-dot"></span>Calibration Due – XRF Machine</div>
              <div className="n-sub">Due in 3 days · ID: XRF-002</div>
            </div>
            <div className="notif-item">
              <div className="n-title"><span className="notif-dot"></span>Licence Expiry Alert</div>
              <div className="n-sub">BIS Licence expires in 42 days</div>
            </div>
            <div className="notif-item">
              <div className="n-title"><span className="notif-dot"></span>14 Articles Pending HUID</div>
              <div className="n-sub">Batch #2024-B078 awaiting tagging</div>
            </div>
          </div>
        </div>
        
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => setLocked(true)} 
          style={{ borderColor: '#345', color: '#9AB', background: 'transparent' }}
        >
          <i className="ti ti-lock"></i>
        </button>
      </div>
    </div>
  );
}
