import { useCallback, useEffect, useState } from 'react';
import './App.css';
import Greeter from './pages/Greeter';
import type { User } from '@chattar/types';
import { AuthContext } from './AuthContext';

// For development
const isDevMode: Boolean = true;

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const refreshAuth = useCallback(async () => {
    if (isDevMode) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshAuth();
    })();
  }, [refreshAuth]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, setUser, setIsAuthenticated, refreshAuth }}
    >
      <div>{isAuthenticated ? <p> Well you're authenticated lol </p> : <Greeter />}</div>
    </AuthContext.Provider>
  );
}

/*
 */
export default App;
