import { Providers } from '@/components/Providers';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function UsuariosLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ProtectedLayout requireAdmin>{children}</ProtectedLayout>
    </Providers>
  );
}
