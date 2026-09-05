import Bun from 'bun';
import { test, expect } from 'vitest';
import { registerUser, loginUser, updateUserKeys } from '../src/services/userService.ts';

import User from '../src/models/User';

const { publicKey } = await (async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt'],
  );

  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

  return {
    publicKey: publicKeyBase64,
  };
})();

const successUser = new User({
  username: 'tarffie',
  password: 'testPassword',
  email: 'exampleEmail@example.com',
  publicKey: publicKey,
});

console.log(publicKey);

const { password: t, ...safeUser } = successUser.toJSON();

test('REGISTER: should return success when registering a USER', async () => {
  expect(
    await registerUser({
      username: 'tarffie',
      password: 'testPassword',
      email: 'exampleEmail@example.com',
      publicKey: publicKey,
    }),
  ).toBe({ success: true, data: safeUser });
});

test('LOGIN: should return success when authenticating a USER', async () => {
  expect(
    await loginUser({
      email: 'exampleEmail@example.com',
      password: 'testPassword',
    }),
  ).toBe({ success: true, data: typeof User });
});

test('REGISTER: should return failure when registering a USER', async () => {
  expect(
    await registerUser({
      username: 'tarffie',
      password: 'testPassword',
      email: 'exampleEmail@example.com',
      publicKey: publicKey,
    }),
  ).toBe(typeof Error);
});
