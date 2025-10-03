'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface MemberSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const MemberSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarExpanded,
  setSidebarExpanded
}: MemberSidebarProps) => {
  const pathname = usePathname();

  // Close sidebar when clicking outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!document.querySelector('.sidebar')) return;
      if (
        !sidebarOpen ||
        document.querySelector('.sidebar')?.contains(target as Node)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Close sidebar when pressing escape key
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <aside
      className={`sidebar absolute left-0 top-0 z-9999 flex h-screen flex-col overflow-y-hidden bg-white transition-all duration-300 ease-in-out dark:bg-gray-dark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarExpanded ? 'w-72' : 'w-20'}`}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
        <Link href="/member/dashboard" className="flex items-center gap-2">
          <span className={`text-xl font-semibold text-blue-600 ${!sidebarExpanded && 'hidden'}`}>
            Member Portal
          </span>
          {!sidebarExpanded && (
            <span className="text-xl font-semibold text-blue-600">MP</span>
          )}
        </Link>

        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="hidden rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 lg:block"
          aria-label={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          title={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <svg
            className={`h-6 w-6 text-gray-500 transition-transform ${
              sidebarExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          aria-label="Close Navigation Menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="text-xs font-medium">Close</span>
        </button>
      </div>

      {/* Sidebar menu */}
      <div className="custom-scrollbar flex flex-col overflow-y-auto duration-300 ease-in-out">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className={`mb-4 ml-4 text-sm font-medium text-gray-400 ${!sidebarExpanded && 'hidden'}`}>
              MEMBER MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Dashboard */}
              <li>
                <Link
                  href="/member/dashboard"
                  className={`menu-item group ${
                    pathname === '/member/dashboard'
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname === '/member/dashboard'
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Dashboard</span>
                </Link>
              </li>

              {/* News & Information */}
              <li>
                <Link
                  href="/member/news"
                  className={`menu-item group ${
                    pathname.includes('/member/news')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/member/news')
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 1v1m-1 10H9m12 0a2 2 0 01-2 2H7m0 0a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V7a2 2 0 012-2"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Berita & Informasi</span>
                </Link>
              </li>

              {/* My Attendance */}
              <li>
                <Link
                  href="/member/attendance"
                  className={`menu-item group ${
                    pathname.includes('/member/attendance')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/member/attendance')
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>My Attendance</span>
                </Link>
              </li>

              {/* My Cell Group */}
              <li>
                <Link
                  href="/member/cell-group"
                  className={`menu-item group ${
                    pathname.includes('/member/cell-group')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/member/cell-group')
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>My Cell Group</span>
                </Link>
              </li>

              {/* My Classes */}
              <li>
                <Link
                  href="/member/classes"
                  className={`menu-item group ${
                    pathname.includes('/member/classes')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/member/classes')
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>My Classes</span>
                </Link>
              </li>

              {/* Projects & Donations */}
              <li>
                <Link
                  href="/member/projects"
                  className={`menu-item group ${
                    pathname.includes('/member/projects')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/member/projects')
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Projects & Donations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h3 className={`mb-4 ml-4 text-sm font-medium text-gray-400 ${!sidebarExpanded && 'hidden'}`}>
              QUICK ACTIONS
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* My Profile */}
              <li>
                <Link
                  href="/member/profile"
                  className={`menu-item group ${
                    pathname.includes('/member/profile')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/member/profile')
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>My Profile</span>
                </Link>
              </li>

              {/* Logout */}
              <li>
                <Link
                  href="/auth/logout"
                  className="menu-item group menu-item-inactive"
                >
                  <svg
                    className="h-5 w-5 menu-item-icon-inactive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default MemberSidebar;
