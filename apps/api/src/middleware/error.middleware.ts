import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de logging de requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Cuando la respuesta termine, loguear
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
};

export const errorHandler = (
  err: Error | AppError | ZodError | jwt.JsonWebTokenError | jwt.TokenExpiredError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Extraer información del request para el log
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    user: req.user ? { id: req.user.id, email: req.user.email } : null,
    timestamp: new Date().toISOString(),
  };

  // Error de validación de Zod
  if (err instanceof ZodError) {
    // Construir mensaje específico combinando los errores por campo
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    
    // Usar el primer mensaje de error como mensaje principal si hay errores específicos
    const message = details.length > 0 
      ? details.map(d => `${d.field ? d.field + ': ' : ''}${d.message}`).join('; ')
      : 'Error de validación de datos';

    logger.warn(`${req.method} ${req.originalUrl} - ${message}`, {
      ...errorContext,
      details,
    });

    return res.status(400).json({
      success: false,
      message,
      details,
    });
  }

  // Token expirado
  if (err instanceof jwt.TokenExpiredError) {
    const message = 'Token de autenticación expirado. Por favor, inicia sesión nuevamente.';
    
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`, {
      ...errorContext,
      expiredAt: err.expiredAt,
    });
    
    return res.status(401).json({
      success: false,
      message,
    });
  }

  // Error de JWT
  if (err instanceof jwt.JsonWebTokenError) {
    const message = 'Token de autenticación inválido';
    
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`, {
      ...errorContext,
      jwtError: err.message,
    });
    
    return res.status(401).json({
      success: false,
      message,
    });
  }

  // Error operacional (AppError)
  if (err instanceof AppError) {
    // Logs diferentes según severidad
    if (err.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
        ...errorContext,
        statusCode: err.statusCode,
        details: err.details,
        stack: err.stack,
      });
    } else if (err.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} - ${err.message}`, {
        ...errorContext,
        statusCode: err.statusCode,
        details: err.details,
      });
    }
    
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Error no manejado (500)
  const message = 'Error interno del servidor';
  
  logger.error(`${req.method} ${req.originalUrl} - ${message}: ${err.message}`, {
    ...errorContext,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });

  return res.status(500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
};

// Middleware para errores asíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
