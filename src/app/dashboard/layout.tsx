import { Providers } from '@/components/Providers';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ProtectedLayout>{children}</ProtectedLayout>
    </Providers>
  );
}
