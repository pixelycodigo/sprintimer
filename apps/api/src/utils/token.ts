import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
}

export function generateToken(user: Usuario): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(user: Usuario): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
