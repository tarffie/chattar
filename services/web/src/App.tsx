import { useState, useEffect } from "react";
import "./App.css";
import { Home } from "./pages/Home";
import type { User } from "@chattar/types";

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        }

      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        {isAuthenticated ? <p> hello, {user?.username} </p> : <Home />}
      </div>
    </>
  );
}

export default App;
