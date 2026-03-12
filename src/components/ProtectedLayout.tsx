'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function ProtectedLayout({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (requireAdmin && user.rol !== 'admin') router.replace('/dashboard');
    }
  }, [user, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && user.rol !== 'admin') return null;

  return <Layout>{children}</Layout>;
}
