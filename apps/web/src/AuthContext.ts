import { createContext, useContext } from 'react';
import type { User } from '@chattar/types';

export const AuthContext = createContext<{
  user: User | undefined;
  isAuthenticated: boolean;
  // eslint-disable-next-line no-unused-vars
  setUser: (user: User) => void;
  // eslint-disable-next-line no-unused-vars
  setIsAuthenticated: (auth: boolean) => void;
  refreshAuth: () => Promise<void>;
}>(null!);

export const useAuth = () => useContext(AuthContext);
