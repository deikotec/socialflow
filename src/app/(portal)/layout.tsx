export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="border-b bg-white dark:bg-neutral-950 px-8 py-4 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">
          SocialFlow Portal
        </div>
        <div className="text-sm text-neutral-500">Client Access</div>
      </header>
      <main className="container mx-auto py-8 px-4">{children}</main>
    </div>
  );
}
