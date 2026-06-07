import { createAuthClient } from 'better-auth/react';
import { getToken, setToken } from '@/lib/api';

const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  fetchOptions: {
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get('set-auth-token');
      if (token) {
        setToken(token);
      }
    },
    auth: {
      type: 'Bearer',
      token: () => getToken() ?? '',
    },
  },
});

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } =
  authClient;
