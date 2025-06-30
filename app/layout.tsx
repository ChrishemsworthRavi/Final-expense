import './globals.css';
import QueryProvider from '@/app/query-provider';

export const metadata = {
  title: 'Expense Tracker',
  description: 'Manage your finances smartly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
