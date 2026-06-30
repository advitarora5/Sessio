type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f7fee7_42%,#ffffff_100%)] text-foreground">
      {children}
    </div>
  );
}
