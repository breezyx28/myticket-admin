import type { AdminRole } from '@/types/domain';
import { createContext } from 'react';

export type SessionUser = {
  id?: string;
  email: string;
  name: string;
  role: AdminRole;
};

export type SignInFailureReason =
  | 'invalid'
  | 'not_admin'
  | 'network'
  | 'credentials'
  | 'session'
  | 'server';

export type AuthContextValue = {
  user: SessionUser | null;
  signIn: (params: { email: string; password: string }) => Promise<{ ok: true } | { ok: false; reason: SignInFailureReason }>;
  signOut: () => void;
  /** Updates in-memory + persisted session user fields (e.g. display name after profile save). */
  updateUser: (patch: Partial<SessionUser>) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
