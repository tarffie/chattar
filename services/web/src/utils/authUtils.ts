import { generateKeypair, getPrivateKey, storePrivateKey } from './cryptoUtils';

/**
 * Receives two strings and sends a request to the login endpoint
 * @param {string} email username or email of the user to identify them
 * @param {string} password user password
 */
export const login = async (email: string, password: string): Promise<void> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const { user } = await response.json();

  if (!user) {
    throw new Error('Login failed');
  }
  const existingKey = await getPrivateKey(user.id);

  if (!existingKey) {
    const { publicKey, privateKey } = await generateKeypair();

    await fetch('/api/auth/add-device-key', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicKey }),
    });

    await storePrivateKey(user.id, privateKey);
  }
};

/**
 * Receives three strings and sends a POST request to the registration endpoint
 * @param {string} username username of the user to identify them
 * @param {string} email email of the user
 * @param {string} password user password
 */
export const register = async (
  username: string,
  email: string,
  password: string,
): Promise<void> => {
  // Generate encryption key pair on client
  const { publicKey, privateKey } = await generateKeypair();

  if (!publicKey || !privateKey) {
    throw new Error('Failed to generate encryption keys');
  }

  // Send registration with public key
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
      publicKey,
    }),
  });

  if (!response.ok) {
    const { statusText } = response;
    throw new Error(statusText || 'Registration failed');
  }

  const { user } = await response.json();

  // Store private key locally (NEVER send to server!)
  await storePrivateKey(user.id, privateKey);
};
