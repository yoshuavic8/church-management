'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  backTo?: string; // Optional path to navigate back to
};

export default function Header({ title, showBackButton = true, actions, backTo }: HeaderProps) {
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

  // Determine where the back button should navigate to
  const handleBackClick = () => {
    if (backTo) {
      router.push(backTo);
    } else {
      if (isMainSectionPage) {
        router.push('/dashboard');
      } else {
        router.back();
      }
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        {shouldShowBackButton && (
          <button
            onClick={handleBackClick}
            className="mr-3 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            aria-label="Go back"
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
                {isMainSectionPage ? 'Dashboard' : 'Back'}
              </span>
            </div>
          </button>
        )}
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      {actions && (
        <div className="flex space-x-3">
          {actions}
        </div>
      )}
    </div>
  );
}
