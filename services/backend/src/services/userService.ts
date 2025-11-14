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
  email: z.string().email(),
  publicKey: z.string().min(40), // Rough check for base64 length
});

const registerUser = async (userInput: {
  username: string;
  informedPassword: string;
  email: string;
  publicKey: string;
}) => {
  try {
    const validated = RegisterUserSchema.parse(userInput);
    if (!validated) throw new Error("The provided user input wasn't valid.");
    await connectDB();

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
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new Error(`Validation failed: ${e.message}`);
    }
    const { message } = e as Error;
    throw new Error(
      `An error ocurred while storing user on database: ${message}`,
    );
  }
};

export { registerUser };
