import { useState, useEffect } from 'react';
import './App.css';
import { Home } from './pages/Home';
import type { User } from '@chattar/types';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setTimeout(() => {
            setUser(data.user);
            setIsAuthenticated(true);
          }, 100);
        }
        // Fallback
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>{isAuthenticated ? <p> hello, {user!.username} </p> : <Home />}</div>
    </>
  );
}

export default App;
