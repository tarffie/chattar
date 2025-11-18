export const login = async (identification: string, password: string) => {
  "use server";
  const loginData = {
    identification: identification,
    password: password,
  };

  try {
    if (!loginData.identification || !loginData.password) {
      throw new Error("Missing fields");
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error);
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    const { message } = error as Error;
    return message.toString();
  }
};
