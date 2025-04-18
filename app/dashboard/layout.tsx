export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Render only the children without additional layout
  // since the Layout component in page.tsx already provides the sidebar
  return children;
}
