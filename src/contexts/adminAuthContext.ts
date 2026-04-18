import type { AdminRole } from '@/types/domain';
import { createContext } from 'react';

export type SessionUser = {
  email: string;
  name: string;
  role: AdminRole;
};

export type AuthContextValue = {
  user: SessionUser | null;
  signIn: (params: { email: string; password: string }) =>
    | { ok: true }
    | { ok: false; reason: 'invalid' | 'not_admin' };
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
