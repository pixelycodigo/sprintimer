# 📝 Plan de Logging Futuro - SprinTask API

**Fecha de creación:** 9 de Marzo, 2026
**Estado:** ⏳ Pendiente para implementación futura
**Prioridad:** Baja (logging actual es suficiente)

---

## 📋 Resumen

Este documento describe el plan para expandir el sistema de logging a los **servicios** y **repositorios** del backend en caso de ser necesario en el futuro.

**Estado actual:** ✅ Logging completo en controladores (16 archivos, ~80 métodos)

---

## 🎯 ¿Por qué este plan es opcional?

El logging actual en controladores es **suficiente para el 95% de los casos** porque:

1. ✅ Captura todos los requests entrantes
2. ✅ Registra errores de validación, autenticación y autorización
3. ✅ Registra resultados de operaciones (éxito/fracaso)
4. ✅ Incluye contexto completo (usuario, IDs, datos)
5. ✅ Registra tiempos de respuesta HTTP
6. ✅ El middleware de errores captura stack traces completos

**Solo implementar este plan si:**
- Hay errores difíciles de diagnosticar desde los controladores
- Se necesita auditoría detallada de lógica de negocio
- Hay procesos asíncronos o jobs en segundo plano
- Se requieren métricas de rendimiento a nivel de servicio/repositorio

---

## 📊 Arquitectura de Logging por Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                         REQUEST HTTP                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MIDDLEWARE (✅ COMPLETADO)                                      │
│  - requestLogger: Logs HTTP automáticos                          │
│  - authMiddleware: Logs de autenticación                         │
│  - errorHandler: Logs de errores                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLADORES (✅ COMPLETADO - 16 archivos)                     │
│  - Logs de entrada/salida de cada endpoint                       │
│  - Logs de validación de datos                                   │
│  - Logs de errores por operación                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICIOS (⏳ PENDIENTE - 16 archivos)                          │
│  - Logs de lógica de negocio                                     │
│  - Logs de reglas de negocio                                     │
│  - Logs de integración con servicios externos                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  REPOSITORIOS (⏳ PENDIENTE - 11 archivos)                       │
│  - Logs de queries a base de datos                               │
│  - Logs de transacciones                                         │
│  - Logs de rendimiento de queries                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos a Actualizar (Fase Futura)

### Servicios (16 archivos)

| # | Archivo | Métodos | Prioridad | Justificación |
|---|---------|---------|-----------|---------------|
| 1 | `auth.service.ts` | registro, login, refreshToken, etc. | 🔴 Alta | Autenticación es crítica |
| 2 | `cliente.service.ts` | create, update, delete, etc. | 🟡 Media | CRUD importante |
| 3 | `talent.service.ts` | create, update, delete, changePassword | 🟡 Media | CRUD importante |
| 4 | `proyecto.service.ts` | create, update, delete, etc. | 🟡 Media | CRUD importante |
| 5 | `actividad.service.ts` | create, update, delete, duplicate | 🟡 Media | CRUD importante |
| 6 | `dashboard.service.ts` | getStats | 🟢 Baja | Solo lectura |
| 7 | `cliente-dashboard.service.ts` | getStats, getProyectos | 🟢 Baja | Solo lectura |
| 8 | `talent-dashboard.service.ts` | getStats, tareas CRUD | 🟢 Baja | Solo lectura |
| 9 | `super-admin-dashboard.service.ts` | getStats | 🟢 Baja | Solo lectura |
| 10 | `usuarios.service.ts` | CRUD completo | 🟡 Media | Gestión de usuarios |
| 11 | `perfil.service.ts` | CRUD | 🟢 Baja | Configuración |
| 12 | `seniority.service.ts` | CRUD | 🟢 Baja | Configuración |
| 13 | `divisa.service.ts` | CRUD | 🟢 Baja | Configuración |
| 14 | `costoPorHora.service.ts` | CRUD | 🟡 Media | Reglas de negocio |
| 15 | `asignacion.service.ts` | CRUD, bulk operations | 🟡 Media | Lógica compleja |
| 16 | `eliminado.service.ts` | restore, delete | 🟡 Media | Auditoría importante |

### Repositorios (11 archivos)

| # | Archivo | Queries | Prioridad | Justificación |
|---|---------|---------|-----------|---------------|
| 1 | `usuario.repository.ts` | findById, findByEmail, create, etc. | 🟡 Media | Tabla crítica |
| 2 | `cliente.repository.ts` | findAll, findById, create, etc. | 🟢 Baja | CRUD estándar |
| 3 | `talent.repository.ts` | findAll, findById, create, etc. | 🟢 Baja | CRUD estándar |
| 4 | `proyecto.repository.ts` | findAll, findByClienteId, etc. | 🟢 Baja | CRUD estándar |
| 5 | `actividad.repository.ts` | findAll, findByProyectoId, etc. | 🟢 Baja | CRUD estándar |
| 6 | `perfil.repository.ts` | findAll, create, update | 🟢 Baja | CRUD simple |
| 7 | `seniority.repository.ts` | findAll, create, update | 🟢 Baja | CRUD simple |
| 8 | `divisa.repository.ts` | findAll, findById, create | 🟢 Baja | CRUD simple |
| 9 | `costoPorHora.repository.ts` | findAll, create, update | 🟢 Baja | CRUD simple |
| 10 | `asignacion.repository.ts` | findAll, create, delete | 🟢 Baja | CRUD simple |
| 11 | `eliminado.repository.ts` | findAll, restore, delete | 🟢 Baja | CRUD simple |

---

## 🔧 Patrón de Implementación - Servicios

### Ejemplo: `auth.service.ts`

```typescript
import logger from '../config/logger.js';

export class AuthService {
  async registro(data: RegistroData): Promise<AuthResponse> {
    logger.debug('AuthService.registro - Iniciando registro de usuario', {
      email: data.email,
      usuario: data.usuario,
    });

    // Verificar si el email ya existe
    const emailExists = await usuarioRepository.emailExists(data.email);
    if (emailExists) {
      logger.warn('AuthService.registro - Email ya registrado', {
        email: data.email,
      });
      throw new AppError('El email ya está registrado', 400);
    }

    // Verificar si el usuario ya existe
    const usuarioExists = await usuarioRepository.usuarioExists(data.usuario);
    if (usuarioExists) {
      logger.warn('AuthService.registro - Usuario ya existe', {
        usuario: data.usuario,
      });
      throw new AppError('El usuario ya existe', 400);
    }

    // Hashear contraseña
    logger.debug('AuthService.registro - Hasheando contraseña');
    const passwordHash = await hashPassword(data.password);

    // Rol por defecto: administrador (id = 2)
    const rolId = 2;

    // Crear usuario
    logger.debug('AuthService.registro - Creando usuario en BD');
    const userId = await usuarioRepository.create({
      nombre: data.nombre,
      usuario: data.usuario,
      email: data.email,
      password_hash: passwordHash,
      rol_id: rolId,
      email_verificado: false,
      activo: true,
    });

    // Obtener usuario completo
    const usuario = await usuarioRepository.findById(userId);
    if (!usuario) {
      logger.error('AuthService.registro - Error al obtener usuario creado', {
        userId,
      });
      throw new AppError('Error al crear el usuario', 500);
    }

    // Generar tokens
    logger.debug('AuthService.registro - Generando tokens JWT');
    const token = generateToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    logger.info('AuthService.registro - Usuario registrado exitosamente', {
      userId,
      email: data.email,
      rol: usuario.rol,
    });

    return {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        email: usuario.email,
        rol: usuario.rol!,
        avatar: usuario.avatar || undefined,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    logger.info('AuthService.login - Intento de login', {
      email: data.email,
    });

    // Buscar usuario por email
    const usuario = await usuarioRepository.findByEmail(data.email);
    if (!usuario) {
      logger.warn('AuthService.login - Email no encontrado', {
        email: data.email,
      });
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(data.password, usuario.password_hash);
    if (!isValidPassword) {
      logger.warn('AuthService.login - Contraseña inválida', {
        email: data.email,
        userId: usuario.id,
      });
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      logger.warn('AuthService.login - Usuario inactivo', {
        email: data.email,
        userId: usuario.id,
      });
      throw new AppError('Usuario inactivo', 403);
    }

    // Generar tokens
    const token = generateToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    // Actualizar último login
    await usuarioRepository.update(usuario.id, { ultimo_login: new Date() });

    logger.info('AuthService.login - Login exitoso', {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        email: usuario.email,
        rol: usuario.rol!,
        avatar: usuario.avatar || undefined,
      },
      token,
      refreshToken,
    };
  }
}
```

---

## 🔧 Patrón de Implementación - Repositorios

### Ejemplo: `usuario.repository.ts`

```typescript
import logger from '../config/logger.js';

export class UsuarioRepository {
  private tableName = 'usuarios';

  async findById(id: number): Promise<Usuario | null> {
    const start = Date.now();
    
    try {
      const usuario = await db<Usuario>(this.tableName)
        .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
        .select('usuarios.*', 'roles.nombre as rol')
        .where('usuarios.id', id)
        .first();

      const duration = Date.now() - start;
      
      if (usuario) {
        logger.debug(`UsuarioRepository.findById - Usuario encontrado (${duration}ms)`, {
          id,
          email: usuario.email,
        });
      } else {
        logger.debug(`UsuarioRepository.findById - Usuario no encontrado (${duration}ms)`, {
          id,
        });
      }

      return usuario || null;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`UsuarioRepository.findById - Error (${duration}ms)`, {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const start = Date.now();
    
    try {
      const usuario = await db<Usuario>(this.tableName)
        .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
        .select('usuarios.*', 'roles.nombre as rol')
        .where('usuarios.email', email)
        .first();

      const duration = Date.now() - start;
      
      if (usuario) {
        logger.debug(`UsuarioRepository.findByEmail - Usuario encontrado (${duration}ms)`, {
          email,
          id: usuario.id,
        });
      }

      return usuario || null;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`UsuarioRepository.findByEmail - Error (${duration}ms)`, {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async create(data: UsuarioCreate): Promise<number> {
    const start = Date.now();
    
    try {
      logger.debug('UsuarioRepository.create - Creando usuario', {
        email: data.email,
        usuario: data.usuario,
      });

      const [id] = await db<Usuario>(this.tableName).insert(data);
      
      const duration = Date.now() - start;
      logger.info(`UsuarioRepository.create - Usuario creado (${duration}ms)`, {
        id,
        email: data.email,
      });

      return id;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`UsuarioRepository.create - Error (${duration}ms)`, {
        email: data.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
```

---

## 📊 Niveles de Logging por Capa

| Capa | Nivel | Tipo de Información |
|------|-------|---------------------|
| **Middleware** | http, warn, error | Requests, autenticación, errores globales |
| **Controladores** | debug, info, warn, error | Entrada/salida, validación, errores por operación |
| **Servicios** | debug, info, warn, error | Lógica de negocio, reglas, integración externa |
| **Repositorios** | debug, error | Queries, transacciones, rendimiento de BD |

---

## ⚠️ Consideraciones Importantes

### 1. **No loguear información sensible**

```typescript
// ❌ MAL
logger.debug('Login', { email, password });

// ✅ BIEN
logger.debug('Login intent', { email });
```

### 2. **No loguear en bucles**

```typescript
// ❌ MAL - Puede generar miles de logs
for (const item of items) {
  logger.debug('Procesando item', { id: item.id });
}

// ✅ BIEN
logger.debug('Procesando items', { total: items.length });
```

### 3. **Usar el nivel apropiado**

| Nivel | Cuándo usar |
|-------|-------------|
| `error` | Errores que requieren atención inmediata |
| `warn` | Errores recuperables, validaciones fallidas |
| `info` | Operaciones exitosas importantes |
| `debug` | Información detallada para debugging |

### 4. **Impacto en rendimiento**

- Logging en controladores: ~1-2ms por request (aceptable)
- Logging en servicios: ~2-5ms adicionales por operación
- Logging en repositorios: ~5-10ms adicionales por query

**Recomendación:** En producción, usar nivel `info` o superior para minimizar impacto.

---

## 🎯 Criterios para Implementar

### Implementar logging en servicios si:

- [ ] Hay errores que no se pueden diagnosticar desde controladores
- [ ] Se necesita auditoría de reglas de negocio específicas
- [ ] Hay integración con servicios externos (APIs, emails, etc.)
- [ ] Hay procesos asíncronos o colas de trabajo
- [ ] Se requieren métricas de tiempo por operación de negocio

### Implementar logging en repositorios si:

- [ ] Hay queries lentos que necesitan optimización
- [ ] Se necesita auditoría de acceso a datos
- [ ] Hay transacciones complejas que pueden fallar
- [ ] Se requiere debugging de problemas de concurrencia

---

## 📈 Métricas de Éxito

| Métrica | Actual | Con Servicios | Con Repositorios |
|---------|--------|---------------|------------------|
| **Cobertura de logging** | ~90% | ~95% | ~98% |
| **Líneas de código agregadas** | - | ~400 | ~300 |
| **Impacto en rendimiento** | ~2ms | ~5ms | ~10ms |
| **Tamaño de logs diarios** | ~50MB | ~100MB | ~200MB |
| **Tiempo de diagnóstico** | ~5min | ~3min | ~2min |

---

## 📝 Plan de Implementación (Cuando sea necesario)

### Fase 1: Servicios Críticos (2-3 horas)
1. `auth.service.ts` - Autenticación
2. `cliente.service.ts` - Clientes
3. `talent.service.ts` - Talents

### Fase 2: Servicios Importantes (3-4 horas)
1. `proyecto.service.ts` - Proyectos
2. `actividad.service.ts` - Actividades
3. `asignacion.service.ts` - Asignaciones
4. `usuarios.service.ts` - Usuarios

### Fase 3: Servicios Secundarios (2-3 horas)
1. `dashboard.service.ts` y variantes
2. `perfil.service.ts`
3. `seniority.service.ts`
4. `divisa.service.ts`
5. `costoPorHora.service.ts`
6. `eliminado.service.ts`

### Fase 4: Repositorios (Opcional, 4-5 horas)
1. `usuario.repository.ts` - Crítico
2. Resto de repositorios - Solo si es necesario

---

## 🔗 Recursos Relacionados

- [Documentación de Logs](../apps/api/docs/LOGS.md)
- [Implementación Actual](./IMPLEMENTACION-LOGGING.md)
- [Implementación Parte 2](./IMPLEMENTACION-LOGGING-PARTE2.md)
- [Winston Best Practices](https://github.com/winstonjs/winston#best-practices)

---

**Documento creado:** 9 de Marzo, 2026
**Última actualización:** 9 de Marzo, 2026
**Próxima revisión:** Cuando surjan errores difíciles de diagnosticar

**Estado:** ⏳ Pendiente - No implementar a menos que sea necesario
