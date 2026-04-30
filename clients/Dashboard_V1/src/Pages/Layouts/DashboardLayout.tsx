import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { StudentProvider } from '../../Contexts/StudentsContext';
import { Footer } from './Footer';
import Sidebar from './Siderbar';
import localdata from '../db.json';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );


  const toggleSidebarExpanded = () => {
    const newValue = !sidebarExpanded;
    setSidebarExpanded(newValue);
    localStorage.setItem("sidebar-expanded", newValue.toString());
  };

  return (
    <StudentProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar sidebarExpanded={sidebarExpanded} toggleSidebarExpanded={toggleSidebarExpanded} sidebarOpen={sidebarOpen} closeMobile={() => setSidebarOpen(false)} menuData={localdata.menu} />
        {/* Contenu principal */}
        <div className={clsx(
          'flex flex-col flex-1 transition-all duration-300 ',
          sidebarExpanded ? 'lg:pl-64' : 'lg:pl-20'
        )}>
          {/* Header mobile */}
          <div className="sticky top-0 z-10 flex h-16 shrink-0 bg-white shadow lg:hidden">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <i className="ri-menu-line text-2xl"></i>
            </button>
            <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1 items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  {localdata.menu.find(item => 
                    item.href === location.pathname || 
                    item.submenu?.some(sub => sub.href === location.pathname)
                  )?.name || 'Student Manager'}
                </h1>
              </div>
            </div>
          </div>

          {/* Contenu de la page */}
          <main className="flex-1 overflow-y-auto pb-20">
            <div className="py-6">
              <div className="mx-auto max-w-8xl px-4 sm:px-6 md:px-8">
                {/* Contenu de la page */}
                <Outlet />
              </div>
            </div>
            <Footer sidebarExpanded={sidebarExpanded} />
          </main>
        </div>
      </div>
    </StudentProvider>
  );
};

export default DashboardLayout;