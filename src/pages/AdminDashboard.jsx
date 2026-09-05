import React, { useState, Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Dialog, Transition } from '@headlessui/react';

// --- Komponen Ikon (SVG) ---
const IconInvoices = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconAccounts = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconAddAccount = () => (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);
const IconPaymentSettings = () => (
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);
// Ikon baru untuk Kelola Pemain (Player Configs)
const IconPlayerConfigs = () => (
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const IconUserDashboard = () => (
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);
const IconLogout = () => (
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconMenu = () => (
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
 </svg>
);
const IconClose = () => (
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
);

const CustomNavLink = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-gacha-red text-white'
          : 'text-text-muted hover:bg-primary-dark hover:text-text-light'
      }`
    }
  >
    {children}
  </NavLink>
);

const SidebarContent = ({ onLinkClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const userDashboardLink = `${window.location.origin}/user/dashboard`;

  const handleLogout = () => {
    if (onLinkClick) onLinkClick();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-secondary-dark w-full overflow-y-auto">
      <div className="flex shrink-0 items-center gap-3 px-6 py-5 border-b border-primary-dark">
        <img src="/my-company-logo.png" alt="MondzStore Logo" className="h-10 w-auto" />
        <h1 className="text-xl font-bold text-gacha-red">MondzStore</h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <h2 className="px-4 pt-2 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Manajemen</h2>
        <CustomNavLink to="accounts/list" onClick={onLinkClick}><IconAccounts />Kelola Akun</CustomNavLink>
        <CustomNavLink to="accounts/add" onClick={onLinkClick}><IconAddAccount />Tambah Akun</CustomNavLink>
        <CustomNavLink to="invoices" onClick={onLinkClick}><IconInvoices />Invoices</CustomNavLink>
        <CustomNavLink to="payment-settings" onClick={onLinkClick}><IconPaymentSettings />Pengaturan Pembayaran</CustomNavLink>
        
        {/* Menu Baru: Kelola Gambar Pemain Dinamis */}
        <CustomNavLink to="player-configs" onClick={onLinkClick}><IconPlayerConfigs />Kelola Pemain</CustomNavLink>

        <h2 className="px-4 pt-4 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Lainnya</h2>
        <a href={userDashboardLink} target="_blank" rel="noopener noreferrer" onClick={onLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-primary-dark hover:text-text-light">
          <IconUserDashboard />Dasbor Pengguna
        </a>
      </nav>

      <div className="mt-auto p-4 border-t border-primary-dark">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-gacha-red hover:text-white transition-colors duration-200">
          <IconLogout /><span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const triggerRefresh = () => console.log("Refresh triggered - dummy");

  return (
    <div className="min-h-screen flex bg-primary-dark text-text-light font-sans">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
              as="div"
              className="relative mr-16 flex w-full max-w-xs flex-1"
            >
                <Transition.Child
                   as={Fragment}
                   enter="ease-in-out duration-300"
                   enterFrom="opacity-0"
                   enterTo="opacity-100"
                   leave="ease-in-out duration-300"
                   leaveFrom="opacity-100"
                   leaveTo="opacity-0"
                >
                   <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                     <button
                       type="button"
                       className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-50"
                       onClick={() => setSidebarOpen(false)}
                     >
                       <span className="sr-only">Tutup sidebar</span>
                       <IconClose />
                     </button>
                   </div>
                </Transition.Child>

                 <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
            </Transition.Child>
           </div>
        </Dialog>
      </Transition.Root>

      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 shadow-lg">
        <SidebarContent />
      </div>

      <div className="flex flex-1 flex-col lg:pl-72">
        <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-6 bg-secondary-dark px-4 shadow-sm sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-text-muted hover:text-text-light"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Buka sidebar</span>
            <IconMenu />
          </button>
        </div>

        <main className="flex-1 py-6 px-4 sm:px-6 lg:py-8 lg:px-10">
           <div className="hidden lg:block mb-6 lg:mb-8">
             <h1 className="text-2xl font-bold text-text-light leading-tight">Dashboard Admin</h1>
           </div>
          <div className="mx-auto max-w-none">
            <Outlet context={{ triggerRefresh }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;