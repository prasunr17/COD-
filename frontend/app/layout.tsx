import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'COD MVP - Crypto Operating Dashboard',
  description: 'Track, analyze, and manage your crypto portfolio with AI insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b bg-card">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="text-2xl font-bold">COD MVP</div>
              <div className="flex gap-4">
                <a href="/dashboard" className="text-sm hover:underline">Dashboard</a>
                <a href="/auth/login" className="text-sm hover:underline">Login</a>
              </div>
            </nav>
          </header>

          {/* Main */}
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t bg-card text-center py-4 text-sm text-muted-foreground">
            <p>&copy; 2026 COD MVP. All rights reserved.</p>
            <p className="text-xs mt-2">Informational purposes only. Not financial advice.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
