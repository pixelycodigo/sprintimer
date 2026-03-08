// apps/api/src/utils/hash.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './hash'; // Assuming hash.ts exports these functions

describe('Hash Utility', () => {
  it('should hash a password correctly', async () => {
    const password = 'mySecretPassword123';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword.length).toBeGreaterThan(0);
    expect(hashedPassword).not.toBe(password); // Hashed password should not be plain text
  });

  it('should correctly compare a plain password with its hash', async () => {
    const password = 'anotherSecretPassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false for incorrect password comparison', async () => {
    const password = 'correctPassword';
    const wrongPassword = 'incorrectPassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });

  it('should throw an error if password is not provided for hashing', async () => {
    // @ts-ignore - Intentionally testing invalid input
    await expect(hashPassword(null)).rejects.toThrow();
  });

  it('should throw an error if password or hash is not provided for comparison', async () => {
    const hashedPassword = await hashPassword('test');
    // @ts-ignore
    await expect(comparePassword(null, hashedPassword)).rejects.toThrow();
    // @ts-ignore
    await expect(comparePassword('test', null)).rejects.toThrow();
  });
});
