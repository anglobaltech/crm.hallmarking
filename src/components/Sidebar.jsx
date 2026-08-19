import React from 'react';

export default function Sidebar({ currentDesk, currentPage, setPage }) {
  const sections = {
    reception: [
      { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
      { id: 'intake', icon: 'ti-circle-plus', label: 'Article Intake' },
      { id: 'articles', icon: 'ti-list-details', label: 'Article Register', badge: { text: '248', color: 'gold' } },
      { id: 'delivery_vouchers', icon: 'ti-file-invoice', label: 'Delivery Vouchers' },
      { id: 'delivery', icon: 'ti-package-export', label: 'Delivery / Return' },
      { id: 'discount', icon: 'ti-percent', label: 'Discount & Billing' },
    ],
    quality: [
      { id: 'xrf', icon: 'ti-atom', label: 'XRF Testing' },
      { id: 'weightcheck', icon: 'ti-scale', label: 'Weight Automation' },
      { id: 'imageauto', icon: 'ti-camera', label: 'Image Automation' },
      { id: 'qcreport', icon: 'ti-file-check', label: 'QC Report' },
    ],
    huid: [
      { id: 'huidentry', icon: 'ti-barcode', label: 'HUID Entry', badge: { text: '14' } },
      { id: 'huidregister', icon: 'ti-database', label: 'HUID Register' },
      { id: 'portal-links', icon: 'ti-external-link', label: 'Portal Access' },
    ],
    admin: [
      { id: 'dailyreport', icon: 'ti-report', label: 'Daily Report' },
      { id: 'billing', icon: 'ti-receipt', label: 'Billing & Invoices' },
      { id: 'reminders', icon: 'ti-bell', label: 'Reminders', badge: { text: '3' } },
      { id: 'services', icon: 'ti-briefcase', label: 'Our Services' },
      { id: 'settings', icon: 'ti-adjustments', label: 'Settings' },
    ],
    extra_services: [
      { id: 'lasercutting', icon: 'ti-cut', label: 'Laser Cutting' },
      { id: 'soldering', icon: 'ti-flame', label: 'Soldering' },
      { id: 'fireassay', icon: 'ti-test-pipe', label: 'Fire Assay' },
      { id: 'goldexchange', icon: 'ti-exchange', label: 'Gold Exchange' },
      { id: 'service_vouchers', icon: 'ti-file-invoice', label: 'Delivery Vouchers' },
    ]
  };

  const labels = {
    reception: 'Reception',
    quality: 'Quality / XRF',
    huid: 'HUID Desk',
    admin: 'Admin',
    extra_services: 'Services'
  };

  const items = sections[currentDesk] || [];

  return (
    <div id="sidebar">
      <div className="sb-section">
        <div className="sb-label">{labels[currentDesk]}</div>
        {items.map(item => (
          <div 
            key={item.id}
            className={`sb-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <i className={`ti ${item.icon}`}></i> {item.label}
            {item.badge && (
              <span className={`sb-badge ${item.badge.color || ''}`}>{item.badge.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
