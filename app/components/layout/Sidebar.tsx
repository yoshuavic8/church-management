'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarExpanded,
  setSidebarExpanded
}: SidebarProps) => {
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className={`text-xl font-semibold text-brand-500 ${!sidebarExpanded && 'hidden'}`}>
            Church Management
          </span>
          {!sidebarExpanded && (
            <span className="text-xl font-semibold text-brand-500">CM</span>
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
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Dashboard */}
              <li>
                <Link
                  href="/dashboard"
                  className={`menu-item group ${
                    pathname === '/dashboard'
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}

                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname === '/dashboard'
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

              {/* Members */}
              <li>
                <Link
                  href="/members"
                  className={`menu-item group ${
                    pathname.includes('/members')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}

                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/members')
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Members</span>
                </Link>
              </li>

              {/* Cell Groups */}
              <li>
                <Link
                  href="/cell-groups"
                  className={`menu-item group ${
                    pathname.includes('/cell-groups')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}

                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/cell-groups')
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
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Cell Groups</span>
                </Link>
              </li>

              {/* Ministries */}
              <li>
                <Link
                  href="/ministries"
                  className={`menu-item group ${
                    pathname.includes('/ministries')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}

                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/ministries')
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
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Ministries</span>
                </Link>
              </li>

              {/* Districts */}
              <li>
                <Link
                  href="/districts"
                  className={`menu-item group ${
                    pathname.includes('/districts')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}

                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/districts')
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Districts</span>
                </Link>
              </li>

              {/* Attendance */}
              <li>
                <Link
                  href="/attendance"
                  className={`menu-item group ${
                    pathname.includes('/attendance')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}

                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/attendance')
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
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Attendance</span>
                </Link>
              </li>

              {/* Projects */}
              <li>
                <Link
                  href="/admin/projects"
                  className={`menu-item group ${
                    pathname.includes('/admin/projects')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/admin/projects')
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Projects</span>
                </Link>
              </li>

              {/* Classes */}
              <li>
                <Link
                  href="/classes"
                  className={`menu-item group ${
                    pathname.includes('/classes')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/classes')
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
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Classes</span>
                </Link>
              </li>

              {/* Articles */}
              <li>
                <Link
                  href="/admin/articles"
                  className={`menu-item group ${
                    pathname.includes('/admin/articles')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/admin/articles')
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
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Articles</span>
                </Link>
              </li>

              {/* File Manager */}
              <li>
                <Link
                  href="/admin/file-management"
                  className={`menu-item group ${
                    pathname.includes('/admin/file-management')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/admin/file-management')
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>File Management</span>
                </Link>
              </li>

              {/* Administration */}
              <li>
                <Link
                  href="/admin"
                  className={`menu-item group ${
                    pathname === '/admin'
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname === '/admin'
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Administration</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication Section */}
          <div>
            <h3 className={`mb-4 ml-4 text-sm font-medium text-gray-400 ${!sidebarExpanded && 'hidden'}`}>
              AUTHENTICATION
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Admin Login */}
              <li>
                <Link
                  href="/auth/admin/login"
                  className={`menu-item group ${
                    pathname.includes('/auth/admin/login')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/auth/admin/login')
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
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Admin Login</span>
                </Link>
              </li>

              {/* Member Login */}
              <li>
                <Link
                  href="/auth/member/login"
                  className={`menu-item group ${
                    pathname.includes('/auth/member/login')
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      pathname.includes('/auth/member/login')
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
                  <span className={`${!sidebarExpanded && 'hidden'}`}>Member Login</span>
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

export default Sidebar;
