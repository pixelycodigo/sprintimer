import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token.js';
import { AppError } from './error.middleware.js';
import logger from '../config/logger.js';

// Extender Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { id: number };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`${req.method} ${req.originalUrl} - Token no proporcionado`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      });
      throw new AppError('Token de autenticación no proporcionado', 401);
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const payload = verifyToken(token);
    
    if (!payload) {
      logger.warn(`${req.method} ${req.originalUrl} - Token inválido o expirado`, {
        tokenLength: token.length,
      });
      throw new AppError('Token inválido o expirado', 401);
    }

    // Adjuntar usuario al request
    req.user = payload as TokenPayload;

    logger.debug(`${req.method} ${req.originalUrl} - Usuario autenticado: ${payload.email}`, {
      userId: payload.id,
      email: payload.email,
      rol: payload.rol,
    });

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.warn(`${req.method} ${req.originalUrl} - Error en autenticación`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(new AppError('Token inválido o expirado', 401));
    }
  }
}

export function rolesMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const userRole = req.user.rol;

      if (!allowedRoles.includes(userRole)) {
        throw new AppError('No tienes permisos para realizar esta acción', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Middlewares predefinidos por rol
export const superAdminMiddleware = rolesMiddleware(['super_admin']);
// El super_admin tiene acceso a todas las rutas de administrador
export const adminMiddleware = rolesMiddleware(['administrador', 'super_admin']);
export const talentMiddleware = rolesMiddleware(['talent']);
export const clienteMiddleware = rolesMiddleware(['cliente']);

// Middleware para múltiples roles
export function checkRoles(...roles: string[]) {
  return rolesMiddleware(roles);
}
