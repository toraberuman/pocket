export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Map page has its own full-screen layout without menu bar and edit mode UI
  return <>{children}</>
}
