import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'HallmarkPro Centre, Delhi',
    licence: 'BHC/2021/04872',
    registrationId: '',
    address: '123, Jewellery Market, Karol Bagh, New Delhi - 110005',
    mobile: '9876543210'
  });

  const [hardware, setHardware] = useState({
    scalePort: 'COM3 — Mettler Toledo ME204',
    xrfPort: 'COM5 — Olympus Vanta',
    cameraDevice: 'USB Camera 0 (Article View)'
  });

  const [staffRoles, setStaffRoles] = useState([
    { role: 'Receptionist', desks: ['Reception'] },
    { role: 'Technician', desks: ['Quality', 'XRF'] },
    { role: 'HUID Operator', desks: ['HUID'] },
    { role: 'Manager', desks: ['All'] }
  ]);

  useEffect(() => {
    // fetch('/api/settings').then(res => res.json()).then(data => { setProfile(data.profile); setHardware(data.hardware); setStaffRoles(data.roles); });
  }, []);

  return (
    <div className="page active" id="p-settings">
      <div className="page-title"><i className="ti ti-adjustments"></i> Settings</div>
      
      <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: '12px' }}>Centre Profile</div>
          <div className="form-group">
            <label>Centre Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>BHC Licence Number</label>
            <input type="text" value={profile.licence} onChange={e => setProfile({...profile, licence: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>BIS Registration ID</label>
            <input type="text" placeholder="Your BIS portal login ID" value={profile.registrationId} onChange={e => setProfile({...profile, registrationId: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Centre Address</label>
            <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})}></textarea>
          </div>
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>Contact Mobile</label>
            <input type="tel" value={profile.mobile} onChange={e => setProfile({...profile, mobile: e.target.value})} />
          </div>
          <div className="btn-row">
            <button className="btn btn-gold"><i className="ti ti-device-floppy"></i> Save Profile</button>
          </div>
        </div>
        
        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '12px' }}>Privacy & Access Control</div>
            <div className="form-group">
              <label>Screen Lock PIN</label>
              <input type="password" placeholder="4-digit PIN" maxLength="4" />
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Auto-Lock After</label>
              <select><option>5 minutes</option><option>10 minutes</option><option>15 minutes</option><option>30 minutes</option><option>Never</option></select>
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Data Export Password</label>
              <input type="password" placeholder="For Excel/PDF exports" />
            </div>
            
            <div className="divider"></div>
            
            <div className="card-title" style={{ marginBottom: '10px' }}>Staff Access Roles</div>
            <table>
              <thead>
                <tr><th>Role</th><th>Desks</th><th></th></tr>
              </thead>
              <tbody>
                {staffRoles.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.role}</td>
                    <td>
                      {item.desks.map(d => <span className="tag" key={d}>{d}</span>)}
                    </td>
                    <td><button className="btn btn-outline btn-sm">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="card" style={{ marginTop: '14px' }}>
            <div className="card-title" style={{ marginBottom: '12px' }}>Hardware Config</div>
            <div className="form-group">
              <label>Weighing Scale Port</label>
              <input type="text" value={hardware.scalePort} onChange={e => setHardware({...hardware, scalePort: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>XRF Machine Port</label>
              <input type="text" value={hardware.xrfPort} onChange={e => setHardware({...hardware, xrfPort: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Camera Device</label>
              <input type="text" value={hardware.cameraDevice} onChange={e => setHardware({...hardware, cameraDevice: e.target.value})} />
            </div>
            <div className="btn-row">
              <button className="btn btn-outline btn-sm"><i className="ti ti-plug"></i> Test Connections</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
