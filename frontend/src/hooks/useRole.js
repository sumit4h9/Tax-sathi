'use client';

import { useAuthStore } from '@/store/useAuthStore';

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? null;

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
  };
}
