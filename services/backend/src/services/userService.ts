import connectDB from "../config/database";
import User from "../models/User";
import { z } from "zod";

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
 * Schema object registration to validify User information
 */
const RegisterUserSchema = z.object({
  username: z.string().min(3).max(20),
  informedPassword: z.string().min(6),
  email: z.email(),
  publicKey: z.string().min(40), // Rough check for base64 length
});

/**
 * async function that receives user input information (generally through http request)
 * validates it and then precceds to input it to the database
 * @param {UserInput} userInput
 * @returns {Promise<{string, User}>} Returns if operating succeded and useful user information
 * @throws {Error|z.ZodError} will fail if userInput isn't according to schema or if username or email was
 * already taken
 */
const registerUser = async (userInput: UserInput) => {
  try {
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

    const validated = RegisterUserSchema.parse(userInput);
    if (!validated) throw new Error("The provided user input wasn't valid.");

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
    return { success: true, user: safeUser };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    const { message } = error as Error;
    throw new Error(
      `An error ocurred while storing user on database: ${message}`,
    );
  }
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
  try {
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
  } catch (error) {
    const { message } = error as Error;

    if (message.includes("User not found")) {
      throw error;
    }

    throw new Error("Failed to update user keys");
  }
};

/**
 * async function to get user by username or email
 * @param {string} identification
 * @return {typeof User} user information as workable data
 * @throws {Error} Throws an error if user doesn't exist
 */
const findUser = async (identification: string) => {
  try {
    const user = await User.findOne({
      $or: [{ username: identification }, { email: identification }],
    });

    if (user) {
      return user;
    }
    throw new Error("Couldn't find User");
  } catch (error) {
    const { message } = error as Error;
    throw new Error(message);
  }
};

/**
 * async function to login user with (username|email) and password
 * @param {string} (username|email) username or email from user
 * @param {string} password password from user
 * @returns {Promise<{string,typeof User}>} returns status and user data
 * @throws {Error} throws an error when having any issue authenticating user
 */
const loginUser = async (user: { username: string; password: string }) => {
  try {
    const userData = await findUser(user.username);

    if (!userData) {
      throw new Error("Invalid username, email or password");
    }

    const isPasswordValid = await Bun.password.verify(
      user.password,
      userData.password,
    );

    if (isPasswordValid) {
      return { success: true, user: userData };
    }

    throw new Error("Invalid username, email or password");
  } catch (error) {
    const { message } = error as Error;
    throw new Error(`Authentication failed: ${message}`);
  }
};

export { registerUser, getUserById, loginUser, updateUserKeys };
