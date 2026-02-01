'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      setAuth: (token, admin) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', token);
        }
        set({ token, admin, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
        }
        set({ token: null, admin: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
