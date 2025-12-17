import User from "../models/User";
import { z } from "zod";
import type { RegisterInputSchema as RegisterInput } from "../../../../shared/types";

/**
 * Hash user password using Bun crypto utility and the bcrypt algorithm
 * @param {string} password
 * @return {Promise<string>} encryptedPassword
 */
async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
  });
}

/**
 * Schemas
 */
const RegisterUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  email: z.email(),
  publicKey: z.string().min(40), // Rough check for base64 length
});

/**
 * Schema object registration to validate User information
 */
const LoginUserSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(1),
});

// register user
const registerUser = async (
  registerInput: RegisterInput,
): Promise<Omit<typeof User.prototype, "password"> | Error> => {

  const sanitizedUserInput = RegisterUserSchema.parse({
    username: registerInput.username.toLowerCase(),
    email: registerInput.email.toLowerCase(),
    password: registerInput.password,
    publicKey: registerInput.publicKey,
  });

  if (!sanitizedUserInput) throw new Error("The informed user input wasn't valid.");

  const existingUser = await User.findOne({
    $or: [{ username: registerInput.username }, { email: registerInput.email }],
  });

  if (existingUser) {
    if (existingUser.username === registerInput.username) {
      throw new Error("Username already taken");
    }
    if (existingUser.email === registerInput.email) {
      throw new Error("Email already registered");
    }
  }

  const { username, password, email, publicKey } = registerInput;
  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    username: username,
    password: hashedPassword,
    email: email,
    publicKey: publicKey,
    status: "offline",
  });

  await newUser.save();
  const { password: t, ...safeUser } = newUser.toJSON();
  return { success: true, data: safeUser };
};

const getUserById = async (id: string) => {
  return await User.findOne({
    _id: id,
  });
};

/**
 * Async function to update user registered keys on the database
 * @param {string} userId
 * @param {string} publicKey user publicKey used for e2e cryptography
 * @returns {Promise<void>}
 * @throws {Error} will throw an error if user isn't authenticated or if user doesn't exist
 */
const updateUserKeys = async (
  userId: string,
  publicKey: string,
): Promise<void> => {
  const result = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        deviceKeys: {
          publicKey,
          deviceId: crypto.randomUUID(),
          addedAt: new Date(),
        },
      },
    },
    { new: true },
  );

  if (!result) {
    throw new Error("User not found");
  }
};

/**
 * Async function to get user by username or email
 * @param {string} identification
 * @return {typeof User} user information as workable data
 * @throws {Error} Throws an error if user doesn't exist
 */
const findUser = async (
  identification: string,
): Promise<typeof User.prototype | Error> => {
  const user = await User.findOne({
    $or: [{ username: identification }, { email: identification }],
  });

  if (user) {
    return {
      success: true,
      data: user,
    };
  }
  throw new Error("Couldn't find User");
};

/**
 * Async function to login user with (username|email) and password
 * @returns {Promise<{string,typeof User}>} returns status and user data
 * @throws {Error} throws an error when having any issue authenticating user
 */
const loginUser = async (user: {
  username: string;
  password: string;
}): Promise<{ success: boolean, user: typeof User.prototype } | Error> => {
  const credentials = LoginUserSchema.parse(user);

  if (!credentials) {
    throw new Error("Couldn't parse input");
  }

  const { username, password } = credentials;
  const userData = await findUser(username!);

  if (!userData.success) {
    throw new Error("Invalid username, email or password");
  }

  const isPasswordValid = await Bun.password.verify(
    password,
    userData.data!.password,
  );

  if (isPasswordValid) {
    return { success: true, user: userData };
  } else {
    throw new Error("Invalid username, email or password");
  }

};

export { registerUser, getUserById, loginUser, updateUserKeys };
