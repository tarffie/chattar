import React, { useState } from "react";

interface AuthFormProps {
  mode: "Login" | "Register";
  onLogin: (identification: string, password: string) => Promise<void>;
  onRegister: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void | string>;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onLogin,
  onRegister,
}) => {
  const [identification, setIdentification] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "Login") {
        await onLogin(identification, password);
      } else {
        await onRegister(username, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `${mode} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>{mode}</h2>
      <form onSubmit={handleSubmit}>
        {mode === "Login" ? (
          <div>
            <label htmlFor="identification">Username or Email</label>
            <input
              id="identification"
              type="text"
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {error && <div>{error}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? `${mode}ing...` : mode}
        </button>
      </form>
    </div>
  );
};
