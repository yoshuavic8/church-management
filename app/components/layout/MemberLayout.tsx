'use client';

import { useState, useEffect } from 'react';
import MemberSidebar from './MemberSidebar';
import Header from './Header';

interface MemberLayoutProps {
  children: React.ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Initialize sidebar expanded state from localStorage
  useEffect(() => {
    const storedSidebarExpanded = localStorage.getItem('member-sidebar-expanded');
    setSidebarExpanded(
      storedSidebarExpanded === null ? true : storedSidebarExpanded === 'true'
    );
  }, []);

  // Update localStorage when sidebar expanded state changes
  useEffect(() => {
    localStorage.setItem('member-sidebar-expanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  // Close sidebar when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Member Sidebar */}
      <MemberSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-9998 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Content area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="mx-auto w-full max-w-screen-2xl p-2 md:p-4 lg:p-6 2xl:p-8">
          {children}
        </main>

        {/* Mobile Navigation Floating Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mobile-nav-button"
          aria-label="Open Navigation Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MemberLayout;
