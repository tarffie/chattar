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

/**
 * Compoment with adaptble form, receiving through invocation which code to return
 * Then applying callback functions to respective mode
 * @example
 * <AuthForm mode={"login"|"register"} onLogin={login} onRegister={register} />
 */
export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onLogin,
  onRegister,
}) => {
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
        await onLogin(email, password);
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value.toString())}
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
                onChange={(e) => setUsername(e.target.value.toString())}
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
                onChange={(e) => setEmail(e.target.value.toString())}
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
            onChange={(e) => setPassword(e.target.value.toString())}
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
