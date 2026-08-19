import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function Reminders() {
  const [calibrationSchedule, setCalibrationSchedule] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await client.get('/workflow/reminders');
      setCalibrationSchedule(res.data?.calibrations || []);
      setReminders(res.data?.reminders || []);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const openPortal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getStatusClass = (status, priority, dueDate) => {
    if (status === 'Completed') return 'badge-green';
    if (priority === 'High') return 'badge-red';
    return 'badge-amber';
  };

  const getDotClass = (priority) => {
    if (priority === 'High') return 'red';
    if (priority === 'Normal') return 'amber';
    return 'green';
  };

  return (
    <div className="page active" id="p-reminders">
      <div className="page-title">
        <i className="ti ti-bell"></i> Reminders & Licence Alerts
        <button className="btn btn-outline btn-sm" onClick={fetchReminders} style={{marginLeft: 'auto'}}>
          <i className="ti ti-refresh"></i> Refresh
        </button>
      </div>
      
      {reminders.filter(r => r.priority === 'High').length > 0 && (
        <div className="alert alert-danger">
          <i className="ti ti-alert-triangle"></i> 
          <b>{reminders.filter(r => r.priority === 'High').length} items require immediate attention</b>
        </div>
      )}
      
      <div className="two-col">
        <div>
          <div className="section-title">Licence Expiry</div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">BIS Hallmarking Licence</div>
                <div className="text-sm" style={{ marginTop: '4px' }}>Licence No: BHC/2021/04872</div>
              </div>
              <span className="badge badge-red">42 days left</span>
            </div>
            
            <div className="progress-bar" style={{ marginTop: '12px' }}>
              <div className="progress-fill" style={{ width: '11%', background: 'var(--red)' }}></div>
            </div>
            <div className="text-sm" style={{ marginTop: '6px' }}>Expires: 29 Jul 2024</div>
            
            <div className="btn-row">
              <button className="btn btn-red btn-sm" onClick={() => openPortal('https://www.bis.gov.in/')}>
                <i className="ti ti-external-link"></i> Renew on BIS Portal
              </button>
              <button className="btn btn-outline btn-sm"><i className="ti ti-bell"></i> Set Reminder</button>
            </div>
          </div>
          
          <div className="section-title">Calibration Schedule</div>
          <div className="card">
            <table style={{ width: '100%' }}>
              <thead>
                <tr><th>Equipment</th><th>Last Cal.</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {calibrationSchedule.map((item) => (
                  <tr key={item.id}>
                    <td>{item.equipment}</td>
                    <td className="text-sm">{new Date(item.last_cal_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</td>
                    <td className="text-sm">{new Date(item.due_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</td>
                    <td><span className={`badge ${getStatusClass(item.status, item.priority)}`}>{item.status}</span></td>
                  </tr>
                ))}
                {calibrationSchedule.length === 0 && !loading && (
                  <tr><td colSpan="4" style={{textAlign: 'center'}}>No calibrations scheduled.</td></tr>
                )}
              </tbody>
            </table>
            <div className="btn-row">
              <button className="btn btn-gold btn-sm"><i className="ti ti-plus"></i> Add Calibration Event</button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="section-title">Upcoming Reminders</div>
          <div className="card">
            <div className="timeline">
              {reminders.map((reminder) => (
                <div className="tl-item" key={reminder.id}>
                  <div className={`tl-dot ${getDotClass(reminder.priority)}`}></div>
                  <div className="tl-date">{new Date(reminder.due_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</div>
                  <div className="tl-text"><b>{reminder.title}</b> — {reminder.description}</div>
                </div>
              ))}
              {reminders.length === 0 && !loading && (
                <div style={{textAlign: 'center', color: 'var(--text3)'}}>No upcoming reminders.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
