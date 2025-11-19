import { useState } from "react";
import { HomeButton } from "../components/HomeButton";
import { AuthForm } from "../components/AuthForm";
import { login, register } from "../utils/authUtils";

export const Home = () => {
  const [loginOrRegister, setLoginOrRegister] = useState<"Login" | "Register">(
    "Login",
  );

  return (
    <>
      <h1> Hello, world guest </h1>
      <div className="buttonRow">
        <HomeButton
          index={"loginButton"}
          callbackFn={() => setLoginOrRegister("Login")}
        >
          Login
        </HomeButton>
        <HomeButton
          index={"registerButton"}
          callbackFn={() => setLoginOrRegister("Register")}
        >
          Register
        </HomeButton>
        <p> {loginOrRegister} </p>
      </div>
      <AuthForm mode={loginOrRegister} onLogin={login} onRegister={register} />
    </>
  );
};
