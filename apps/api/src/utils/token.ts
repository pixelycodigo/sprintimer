import jwt, { SignOptions } from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
}

export function generateToken(user: Usuario): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email as string,
    rol: user.rol as string,
  };

  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function generateRefreshToken(user: Usuario): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email as string,
    rol: user.rol as string,
  };

  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
