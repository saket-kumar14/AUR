export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500/30 font-sans">
      <main className="flex flex-col min-h-screen">{children}</main>
    </div>
  );
}
