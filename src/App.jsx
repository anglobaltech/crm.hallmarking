import React, { useState, useEffect } from 'react';
import LockOverlay from './components/LockOverlay';
import TopBar from './components/TopBar';
import DeskNav from './components/DeskNav';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';

import Dashboard from './pages/Dashboard';
import Intake from './pages/Intake';
import Articles from './pages/Articles';
import Delivery from './pages/Delivery';
import DeliveryVoucher from './pages/DeliveryVoucher';
import DeliveryVouchers from './pages/DeliveryVouchers';
import Discount from './pages/Discount';
import WeightCheck from './pages/WeightCheck';
import ImageAuto from './pages/ImageAuto';
import Xrf from './pages/Xrf';
import HuidEntry from './pages/HuidEntry';
import HuidRegister from './pages/HuidRegister';
import PortalLinks from './pages/PortalLinks';
import DailyReport from './pages/DailyReport';
import Reminders from './pages/Reminders';
import Services from './pages/Services';
import Settings from './pages/Settings';
import LaserCutting from './pages/LaserCutting';
import Soldering from './pages/Soldering';
import FireAssay from './pages/FireAssay';
import GoldExchange from './pages/GoldExchange';
import ServiceDeliveryVouchers from './pages/ServiceDeliveryVouchers';
import BillingDashboard from './pages/BillingDashboard';
import Login from './pages/Login';

const deskDefaultPage = {
  reception: 'dashboard',
  quality: 'xrf',
  huid: 'huidentry',
  admin: 'dailyreport',
  extra_services: 'lasercutting'
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [currentDesk, setCurrentDesk] = useState('reception');
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (userData) => {
    setUserContext(userData);
    setIsAuthenticated(true);
    setIsLocked(false);
  };

  const handleDeskChange = (desk) => {
    setCurrentDesk(desk);
    setCurrentPage(deskDefaultPage[desk]);
  };

  // If not authenticated via the main login screen, show login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'intake': return <Intake setPage={setCurrentPage} />;
      case 'articles': return <Articles setPage={setCurrentPage} />;
      case 'delivery': return <Delivery />;
      case 'delivery_vouchers': return <DeliveryVouchers />;
      case 'delivery_voucher': return <DeliveryVoucher />;
      case 'discount': return <BillingDashboard />; // Replaced old Discount with new Billing Dashboard
      case 'xrf': return <Xrf />;
      case 'weightcheck': return <WeightCheck />;
      case 'imageauto': return <ImageAuto />;
      case 'huidentry': return <HuidEntry />;
      case 'huidregister': return <HuidRegister />;
      case 'portal-links': return <PortalLinks />;
      case 'dailyreport': return <DailyReport />;
      case 'reminders': return <Reminders />;
      case 'services': return <Services />;
      case 'settings': return <Settings />;
      case 'lasercutting': return <LaserCutting setPage={setCurrentPage} />;
      case 'soldering': return <Soldering setPage={setCurrentPage} />;
      case 'fireassay': return <FireAssay setPage={setCurrentPage} />;
      case 'goldexchange': return <GoldExchange setPage={setCurrentPage} />;
      case 'service_vouchers': return <ServiceDeliveryVouchers />;
      case 'billing': return <BillingDashboard />;
      default: return <div>Page {currentPage} not implemented yet.</div>;
    }
  };

  return (
    <>
      <LockOverlay isLocked={isLocked} onUnlock={() => setIsLocked(false)} />
      <TopBar setLocked={setIsLocked} setPage={setCurrentPage} userContext={userContext} />
      <DeskNav currentDesk={currentDesk} onDeskChange={handleDeskChange} userContext={userContext} />
      
      <div id="main">
        <Sidebar 
          currentDesk={currentDesk} 
          currentPage={currentPage} 
          setPage={setCurrentPage} 
        />
        <div id="content">
          {renderPage()}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
