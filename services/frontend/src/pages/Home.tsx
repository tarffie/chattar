import { useState } from "react";
import { HomeButton } from "../components/HomeButton";

export const Home = () => {
  const [loginOrRegister, setLoginOrRegister] = useState("Login");

  return (
    <>
      <h1> Hello, world guest </h1>
      <div>
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
    </>
  );
};
