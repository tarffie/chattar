import connectDB from "../config/database";
import User from "../models/User";
import { z } from "zod";

type Result<T> = { success: true; data: T } | { success: false; error: string };

type UserInput = {
  username: string;
  informedPassword: string;
  email: string;
  publicKey: string;
};

/**
 * Hash user password using Bun crypto utilies and the bcrypt algorithm
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
  informedPassword: z.string().min(6),
  email: z.email(),
  publicKey: z.string().min(40), // Rough check for base64 length
});

/**
 * Schema object registration to validify User information
 */
const LoginUserSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(1),
});

// register user
const registerUser = async (
  userInput: UserInput,
): Promise<Result<Omit<typeof User.prototype, "password">>> => {
  const validated = RegisterUserSchema.parse(userInput);
  if (!validated) throw new Error("The provided user input wasn't valid.");

  const existingUser = await User.findOne({
    $or: [{ username: userInput.username }, { email: userInput.email }],
  });

  if (existingUser) {
    if (existingUser.username === userInput.username) {
      throw new Error("Username already taken");
    }
    if (existingUser.email === userInput.email) {
      throw new Error("Email already registered");
    }
  }

  const { username, informedPassword, email, publicKey } = userInput;
  const hashedPassword = await hashPassword(informedPassword);

  const newUser = new User({
    username: username,
    password: hashedPassword,
    email: email,
    publicKey: publicKey,
    status: "offline",
  });

  await newUser.save();
  const { password, ...safeUser } = newUser.toJSON();
  return { success: true, data: safeUser };
};

const getUserById = async (id: string) => {
  return await User.findOne({
    _id: id,
  });
};

/**
 * async function to update user registered keys on the database
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
 * async function to get user by username or email
 * @param {string} identification
 * @return {typeof User} user information as workable data
 * @throws {Error} Throws an error if user doesn't exist
 */
const findUser = async (
  identification: string,
): Promise<Result<typeof User.prototype>> => {
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
 * async function to get users
 */
const findAllUsers = async (
) => {
  const users = await User.find({}).all();
  console.log(users)

  if (users)
    return users
  throw new Error("Something went wrong");
};

/**
 * async function to login user with (username|email) and password
 * @param {string} (username|email) username or email from user
 * @param {string} password password from user
 * @returns {Promise<{string,typeof User}>} returns status and user data
 * @throws {Error} throws an error when having any issue authenticating user
 */
const loginUser = async (user: {
  username: string;
  password: string;
}): Promise<Result<typeof User.prototype>> => {
  const userData = await findUser(user.username);

  if (!userData.success) {
    throw new Error("Invalid username, email or password");
  }

  const isPasswordValid = await Bun.password.verify(
    user.password,
    userData.data!.password,
  );

  if (isPasswordValid) {
    return { success: true, data: userData };
  }

  throw new Error("Invalid username, email or password");
};

export { registerUser, getUserById, loginUser, updateUserKeys, findAllUsers };
