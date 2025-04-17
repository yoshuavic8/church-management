'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  backTo?: string; // Optional path to navigate back to
  backLabel?: string; // Optional label for the back button
};

export default function Header({ title, showBackButton = true, actions, backTo, backLabel }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we're on a detail or edit page
  const isDetailOrEditPage = pathname.split('/').length > 2;

  // Determine if we're on a main section page (like /members, /cell-groups, etc.)
  const isMainSectionPage = pathname.split('/').length === 2 && pathname !== '/dashboard';

  // Show back button if:
  // 1. Explicitly requested AND on a detail/edit page, OR
  // 2. We're on a main section page (and should show a back to dashboard button)
  const shouldShowBackButton = (showBackButton && isDetailOrEditPage) || isMainSectionPage;

  // Determine the back button destination and label
  const getBackDestination = (): { path: string, label: string } => {
    // If backTo is provided, use it
    if (backTo) {
      return {
        path: backTo,
        label: backLabel || getDefaultBackLabel(backTo)
      };
    }

    // If we're on a main section page, go to dashboard
    if (isMainSectionPage) {
      return { path: '/dashboard', label: 'Dashboard' };
    }

    // Otherwise, determine parent route based on current path
    const pathParts = pathname.split('/');

    // Special case for nested routes like /cell-groups/[id]/members
    if (pathParts.length > 3 && pathParts[1] === 'cell-groups' && pathParts[3] === 'members') {
      return { path: `/cell-groups/${pathParts[2]}`, label: 'Cell Group' };
    }

    // For detail pages like /members/[id], go back to the list
    if (pathParts.length === 3) {
      const section = pathParts[1];
      return { path: `/${section}`, label: getSectionLabel(section) };
    }

    // For edit pages like /members/edit/[id], go back to the detail page
    if (pathParts.length === 4 && pathParts[2] === 'edit') {
      const section = pathParts[1];
      const id = pathParts[3];
      return { path: `/${section}/${id}`, label: 'Details' };
    }

    // Default fallback
    return { path: '/dashboard', label: 'Dashboard' };
  };

  // Get a human-readable label for a section
  const getSectionLabel = (section: string): string => {
    const labels: Record<string, string> = {
      'members': 'Members',
      'cell-groups': 'Cell Groups',
      'districts': 'Districts',
      'attendance': 'Attendance',
      'classes': 'Classes',
      'pastoral': 'Pastoral',
      'admin': 'Admin'
    };

    return labels[section] || section.charAt(0).toUpperCase() + section.slice(1);
  };

  // Get a default back label based on the path
  const getDefaultBackLabel = (path: string): string => {
    const pathParts = path.split('/');
    if (pathParts.length <= 1) return 'Back';

    const section = pathParts[1];
    return getSectionLabel(section);
  };

  // Get back destination info
  const backDestination = getBackDestination();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        {shouldShowBackButton && (
          <Link
            href={backDestination.path}
            className="mr-3 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            aria-label={`Go back to ${backDestination.label}`}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="ml-1 text-sm text-gray-600">
                {backDestination.label}
              </span>
            </div>
          </Link>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      <div className="flex space-x-3">
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
