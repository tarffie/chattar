import { test, expect } from "vitest";
import {
  registerUser,
  getUserById,
  loginUser,
  updateUserKeys,
} from "../src/services/userService.ts";

import User from "../src/models/User";

// define user objects to test

// valid user
const user1 = {
  username: "tarffie",
  password: "testPassword",
  email: "exampleEmail@example.com",
};

//test("should say hi", () => {
//  expect(registerUser(user1)).toBe({success: true, data: });
//});
