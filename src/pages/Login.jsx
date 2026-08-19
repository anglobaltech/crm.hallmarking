import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function Login({ onLogin }) {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [username, setUsername] = useState('Admin Delhi');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available tenants for the dropdown
    client.get('/auth/tenants')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setTenants(res.data);
          setTenantId(res.data[0].id.toString());
        } else {
          // Fallback if no tenants found in DB
          const fallback = [{ id: 1, name: 'Demo Centre (Fallback)' }];
          setTenants(fallback);
          setTenantId('1');
        }
      })
      .catch(err => {
        console.error('Failed to fetch tenants', err);
        // Fallback for network errors so user can still login to demo
        const fallback = [{ id: 1, name: 'Demo Centre (Offline / Demo Mode)' }];
        setTenants(fallback);
        setTenantId('1');
      });
  }, []);

  const getDeviceToken = () => {
    let token = localStorage.getItem('device_token');
    if (!token) {
      token = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_token', token);
    }
    return token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const device_token = getDeviceToken();
      const res = await client.post('/auth/login', {
        tenant_id: parseInt(tenantId),
        username: username,
        pin: password,
        device_token: device_token
      });

      // Store JWT token
      localStorage.setItem('token', res.data.token);
      
      onLogin({ 
        username: res.data.user.name, 
        tenantId: res.data.user.tenant_id, 
        role: res.data.user.role 
      });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Login failed');
      } else {
        setError('Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--bg-app)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="card" style={{ width: '400px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', color: 'var(--gold)', marginBottom: '8px' }}>⚜</div>
          <h2 style={{ margin: 0, color: 'var(--text1)', fontWeight: 600 }}>HallmarkPro</h2>
          <div style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '4px' }}>Sign in to your CRM</div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <i className="ti ti-alert-triangle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group full">
            <label>Hallmarking Centre (Tenant)</label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} required>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group full">
            <label>Username / Employee Name</label>
            <input 
              type="text" 
              placeholder="e.g. Admin Delhi" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group full">
            <label>PIN Code</label>
            <input 
              type="password" 
              placeholder="Enter PIN (e.g. 1234)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-gold" 
            style={{ width: '100%', padding: '12px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ width: '100%', padding: '12px', marginTop: '4px', display: 'flex', justifyContent: 'center' }}
            onClick={(e) => {
              setUsername('Admin Delhi');
              setPassword('1234');
              setTenantId('1');
              // Briefly delay to allow state to update before submitting
              setTimeout(() => handleSubmit(e), 100);
            }}
            disabled={loading}
          >
            <i className="ti ti-bolt" style={{ marginRight: '8px' }}></i> Quick Demo Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text3)' }}>
          Secure Multi-Tenant Gateway • Single Device Enforced
        </div>
      </div>
    </div>
  );
}
