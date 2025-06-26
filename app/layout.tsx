// app/layout.tsx
import './globals.css';
import ClientLayout from './client-layout';

export const metadata = {
  title: 'Expense Tracker',
  description: 'Manage your finances smartly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
