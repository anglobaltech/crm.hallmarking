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

  const handleSendOtp = async (email, isForgot = false) => {
    if (!email) {
      setError('Please enter an email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await client.post('/auth/send-otp', { email });
      if (isForgot) setForgotOtpSent(true);
      else setOtpSent(true);
      toast('OTP sent successfully. Check your email.', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (email, otp, isForgot = false) => {
    if (!otp) return setError('Please enter the OTP.');
    setLoading(true);
    setError('');
    try {
      await client.post('/auth/verify-otp', { email, otp });
      if (isForgot) setForgotOtpVerified(true);
      else setEmailVerified(true);
      toast('Email verified successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailVerified) return setError('Please verify your email with OTP first.');
    if (regPassword !== regRetypePassword) return setError('Passwords do not match.');
    if (regMobile.length !== 10) return setError('Mobile number must be exactly 10 digits.');
    
    setLoading(true);
    setError('');

    try {
      let logoUrl = '';
      if (regLogoFile) {
        const formData = new FormData();
        formData.append('logo', regLogoFile);
        const uploadRes = await client.post('/auth/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        logoUrl = uploadRes.data.url;
      }

      await client.post('/auth/register', {
        fullName: regFullName,
        email: regEmail,
        mobile: '+91' + regMobile,
        centreName: regCentreName,
        bisLicence: regBisLicence,
        address: regAddress,
        gstNumber: regGstNumber,
        logoUrl,
        password: regPassword
      });
      
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Your Hallmarking Centre has been successfully registered. You can now log in.',
        icon: 'success',
        confirmButtonColor: '#d4af37',
        background: '#ffffff',
        color: '#333333'
      });
      
      setActiveTab('login');
      // Reset form
      setRegEmail(''); setRegFullName(''); setRegMobile(''); setRegCentreName(''); setRegBisLicence('');
      setRegAddress(''); setRegGstNumber(''); setRegPassword(''); setRegRetypePassword(''); setRegLogoFile(null);
      setEmailVerified(false); setOtpSent(false); setOtpValue('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== retypeNewPassword) return setError('Passwords do not match.');
    setLoading(true);
    setError('');
    try {
      await client.post('/auth/reset-password', { email: forgotEmail, newPassword });
      toast('Password reset successfully. You can now login.', 'success');
      setActiveTab('login');
      setForgotEmail(''); setForgotOtpSent(false); setForgotOtpVerified(false); setForgotOtpValue('');
      setNewPassword(''); setRetypeNewPassword('');
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const regPwdStrength = calculatePasswordStrength(regPassword);
  const newPwdStrength = calculatePasswordStrength(newPassword);

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
        </div>

        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group full">
              <label>Centre Name or Email</label>
              <input 
                type="text" 
                placeholder="e.g. Royal Assaying Centre or email@example.com" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }}
              />
            </div>
            <div className="form-group full">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }}
              />
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '-10px' }}>
              <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '12px', cursor: 'pointer' }} onClick={() => { setActiveTab('forgot'); setError(''); }}>
                Forgot Password?
              </button>
            </div>
            
            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
              <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#ffffff', padding: '0 10px', color: 'var(--text3)', fontSize: '12px' }}>OR</span>
            </div>

            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', borderColor: 'var(--gold)', color: 'var(--gold)' }}
              onClick={(e) => {
                setIdentifier('Admin Delhi');
                setPassword('1234');
                setTimeout(() => {
                  document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 100);
              }}
              disabled={loading}
            >
              <i className="ti ti-bolt" style={{ marginRight: '8px' }}></i> Dummy Login
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <div className="form-group full" style={{ gridColumn: '1 / -1' }}>
              <label>Full Name</label>
              <input type="text" placeholder="Admin Name" value={regFullName} onChange={e => setRegFullName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
            </div>            <div className="form-group full" style={{ gridColumn: '1 / -1' }}>
              <label>Email Address</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" placeholder="email@example.com" value={regEmail} onChange={e => {setRegEmail(e.target.value); setEmailVerified(false); setOtpSent(false);}} disabled={emailVerified} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
                {!emailVerified && !otpSent && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleSendOtp(regEmail)} disabled={loading || !regEmail}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
                {emailVerified && (
                  <span style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: 'bold', padding: '0 10px', backgroundColor: '#d1fae5', borderRadius: '6px', fontSize: '14px' }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            {otpSent && !emailVerified && (
              <div className="form-group full" style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: '#10b981' }}>✓ OTP Sent Successfully</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Enter 6-digit OTP" value={otpValue} onChange={e => setOtpValue(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
                  <button type="button" className="btn btn-gold btn-sm" onClick={() => handleVerifyOtp(regEmail, otpValue)} disabled={loading || !otpValue}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            <div className="form-group full" style={{ gridColumn: '1 / -1' }}>
              <label>Mobile Number</label>
              <div style={{ display: 'flex' }}>
                <span style={{ padding: '10px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '6px 0 0 6px', color: 'var(--text2)' }}>+91</span>
                <input type="text" placeholder="10-digit number" value={regMobile} onChange={e => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} required style={{ flex: 1, padding: '10px', borderRadius: '0 6px 6px 0', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
              </div>
            </div>

            <div className="form-group full">
              <label>Hallmarking Centre Name</label>
              <input type="text" placeholder="e.g. Royal Assaying" value={regCentreName} onChange={e => setRegCentreName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
            </div>

            <div className="form-group full">
              <label>BIS Licence Number</label>
              <input type="text" placeholder="e.g. HM/C-1234567" value={regBisLicence} onChange={e => setRegBisLicence(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
            </div>
            
            <div className="form-group full">
              <label>GST Number</label>
              <input type="text" placeholder="e.g. 22AAAAA0000A1Z5" value={regGstNumber} onChange={e => setRegGstNumber(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
            </div>

            <div className="form-group full">
              <label>Centre Logo</label>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={e => setRegLogoFile(e.target.files[0])} style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)', fontSize: '13px' }} />
            </div>

            <div className="form-group full" style={{ gridColumn: '1 / -1' }}>
              <label>Centre Address</label>
              <textarea placeholder="Full address" value={regAddress} onChange={e => setRegAddress(e.target.value)} required rows="2" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)', resize: 'vertical' }} />
            </div>

            <div className="form-group full">
              <label>Password</label>
              <input type="password" placeholder="Create password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
              {regPassword && (
                <div style={{ marginTop: '4px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Strength:</span>
                  <span style={{ color: regPwdStrength.color, fontWeight: 'bold' }}>{regPwdStrength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group full">
              <label>Retype Password</label>
              <input type="password" placeholder="Confirm password" value={regRetypePassword} onChange={e => setRegRetypePassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
              {regRetypePassword && regPassword !== regRetypePassword && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>Passwords do not match</div>
              )}
            </div>
            
            <button type="submit" className="btn btn-gold" style={{ gridColumn: '1 / -1', width: '100%', padding: '12px', marginTop: '10px', display: 'flex', justifyContent: 'center' }} disabled={loading || !emailVerified}>
              {loading ? 'Creating Account...' : 'Register Centre'}
            </button>
          </form>
        )}

        {activeTab === 'forgot' && (
          <div style={{ padding: '10px 0' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text1)', textAlign: 'center' }}>Reset Password</h3>
            
            {!forgotOtpVerified ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group full">
                  <label>Registered Email</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="email" placeholder="email@example.com" value={forgotEmail} onChange={e => {setForgotEmail(e.target.value); setForgotOtpSent(false);}} disabled={forgotOtpSent} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
                    {!forgotOtpSent && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleSendOtp(forgotEmail, true)} disabled={loading || !forgotEmail}>
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {forgotOtpSent && (
                  <div className="form-group full">
                    <label style={{ color: '#10b981' }}>✓ OTP Sent Successfully</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="Enter 6-digit OTP" value={forgotOtpValue} onChange={e => setForgotOtpValue(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
                      <button type="button" className="btn btn-gold btn-sm" onClick={() => handleVerifyOtp(forgotEmail, forgotOtpValue, true)} disabled={loading || !forgotOtpValue}>
                        {loading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group full">
                  <label>New Password</label>
                  <input type="password" placeholder="Create new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
                  {newPassword && (
                    <div style={{ marginTop: '4px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text3)' }}>Strength:</span>
                      <span style={{ color: newPwdStrength.color, fontWeight: 'bold' }}>{newPwdStrength.label}</span>
                    </div>
                  )}
                </div>

                <div className="form-group full">
                  <label>Retype New Password</label>
                  <input type="password" placeholder="Confirm new password" value={retypeNewPassword} onChange={e => setRetypeNewPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-app)', color: 'var(--text1)' }} />
                  {retypeNewPassword && newPassword !== retypeNewPassword && (
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>Passwords do not match</div>
                  )}
                </div>
                
                <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center' }} disabled={loading}>
                  Reset Password
                </button>
              </form>
            )}

            <button 
              className="btn btn-outline" 
              style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}
              onClick={() => { setActiveTab('login'); setError(''); setForgotOtpSent(false); setForgotOtpVerified(false); }}
            >
              Back to Login
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text3)' }}>
          Secure Multi-Tenant Gateway • Single Device Enforced
        </div>
      </div>
    </div>
  );
}
