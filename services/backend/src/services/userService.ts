import User from '../models/User';
import { z } from 'zod';
import type { RegisterInputSchema as RegisterInput, Result } from '../../../../shared/types';
import { AppError, ValidatorError } from '../errors/AppError';

/**
 * Hash user password using Bun crypto utility and the bcrypt algorithm
 * @param {string} password
 * @return {Promise<string>} encryptedPassword
 */
async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: 'bcrypt',
  });
}

/**
 * Schemas
 */
const RegisterUserSchema = z
  .object({
    username: z.string().min(3).max(36),
    password: z.string().min(6),
    email: z.email(),
    publicKey: z.string().min(40), // Rough check for base64 length
  })
  .strict();

/**
 * Schema object registration to validate User information
 */
const LoginUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
// register user
const registerUser = async (
  registerInput: RegisterInput,
): Promise<Result<Omit<typeof User.prototype, 'password'>>> => {
  const parsedUserInput = RegisterUserSchema.parse({
    username: registerInput.username.toLowerCase(),
    email: registerInput.email.toLowerCase(),
    password: registerInput.password,
    publicKey: registerInput.publicKey,
  });

  if (!parsedUserInput) {
    throw new ValidatorError('The informed user input was invalid.');
  }

  const existingUser = await User.findOne({
    $or: [{ username: registerInput.username }, { email: registerInput.email }],
  });

  if (existingUser) {
    if (
      existingUser.username === registerInput.username ||
      existingUser.email === registerInput.email
    ) {
      throw new ValidatorError('Username or email already taken.');
    }
  }

  const { username, password, email, publicKey } = parsedUserInput;
  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    username: username,
    password: hashedPassword,
    email: email,
    publicKey: publicKey,
    status: 'offline',
  });

  await newUser.save();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
): Promise<Result<typeof User.prototype>> => {
  const user = await User.findByIdAndUpdate(
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

  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  return { success: true, data: user };
};

/**
 * Async function to get user by username or email
 * @param {string} email
 * @return {typeof User} user information as workable data
 * @throws {Error} Throws an error if user doesn't exist
 */
const findUser = async (email: string): Promise<typeof User.prototype> => {
  const user = await User.findOne({ email: email });

  if (user) return user;
  throw new ValidatorError("Couldn't find User");
};

/**
 * Async function to login user with email and password
 * @returns {Promise<{string,typeof User}>} returns status and user data
 * @throws {Error} throws an error when having any issue authenticating user
 */
const loginUser = async (user: {
  email: string;
  password: string;
}): Promise<Result<typeof User.prototype>> => {
  const credentials = LoginUserSchema.parse(user);
  if (!credentials) {
    throw new Error("Couldn't parse input");
  }

  const { email, password } = credentials;
  const userData = await findUser(email);

  if (!userData || userData instanceof ValidatorError) {
    throw new Error('Invalid email or password');
  }
  const isPasswordValid = await Bun.password.verify(password, userData.password);

  if (isPasswordValid) {
    return { success: true, data: userData };
  }
  throw new ValidatorError('Invalid email or password');
};

export { registerUser, getUserById, loginUser, updateUserKeys };
