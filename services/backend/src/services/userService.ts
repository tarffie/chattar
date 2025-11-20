import connectDB from "../config/database";
import User from "../models/User";
import { z } from "zod";

async function hashPassword(password: string) {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
  });
}

const RegisterUserSchema = z.object({
  username: z.string().min(3).max(20),
  informedPassword: z.string().min(6),
  email: z.email(),
  publicKey: z.string().min(40), // Rough check for base64 length
});

const registerUser = async (userInput: {
  username: string;
  informedPassword: string;
  email: string;
  publicKey: string;
}) => {
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

const findUser = async (identification: string) => {
  return await User.findOne({
    $or: [{ username: identification }, { email: identification }],
  });
};

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
