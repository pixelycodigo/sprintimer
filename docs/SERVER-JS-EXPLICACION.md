# 📄 API Server.js - Explicación para Soporte Técnico

**Fecha:** 13 de Marzo, 2026  
**Versión:** 17.0 - Build Legible para Debugging  
**Archivo:** `FTP_DEPLOY/api/server.js`

---

## 🎯 PROPÓSITO DE ESTE DOCUMENTO

Este documento explica la estructura del archivo `server.js` generado por el build system, para facilitar el debugging por parte del equipo de soporte técnico.

---

## 📦 FLUJO DEL BUILD

### **1. Código Fuente (TypeScript)**

```
apps/api/src/
├── server.ts              ← Entry point principal
├── config/
│   ├── cors.ts           ← Configuración CORS
│   └── logger.ts         ← Configuración de Winston logs
├── middleware/
│   └── error.middleware.ts ← Error handling
└── routes/
    └── index.ts          ← Todas las rutas API
```

### **2. Proceso de Build (tsup)**

```bash
npm run build:api
```

**Configuración (`apps/api/tsup.config.ts`):**

```typescript
export default defineConfig({
  entry: ['src/server.ts'],
  outDir: '../../FTP_DEPLOY/api',
  format: ['cjs'],           // CommonJS para Passenger
  target: 'node18',          // Node.js 18+
  bundle: true,              // Todo en 1 archivo
  minify: false,             ← LEGIBLE (NO minificado)
  sourcemap: true,           ← Source maps para debugging
  splitting: false,
  keepNames: true,           ← Mantiene nombres de variables
});
```

### **3. Resultado del Build**

```
FTP_DEPLOY/api/
├── server.js               ← 199 KB (legible)
└── server.js.map           ← 454 KB (source map)
```

---

## 📋 ESTRUCTURA DEL `server.js`

### **Sección 1: Imports y Dependencias (Líneas 1-30)**

```javascript
'use strict';

var express = require('express');
var cors = require('cors');
var helmet = require('helmet');
var dotenv = require('dotenv');
var winston = require('winston');
// ... más dependencias
```

**Propósito:** Todas las dependencias están bundladas en un solo archivo.

---

### **Sección 2: Configuración CORS (Líneas 31-60)**

```javascript
// src/config/cors.ts
var isDevelopment = process.env.NODE_ENV !== "production";
var allowedOrigins = isDevelopment ? [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter((origin) => origin !== void 0) : [];

var corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (!isDevelopment && !process.env.FRONTEND_URL) {
      return callback(null, true);  // Producción: permite cualquier origen
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  maxAge: 86400
};
```

**Variables de entorno usadas:**
- `process.env.NODE_ENV` - 'production' o 'development'
- `process.env.FRONTEND_URL` - Dominio del frontend (ej: `https://pixelycodigo.com`)

---

### **Sección 3: Configuración de Logger (Líneas 61-100)**

```javascript
// src/config/logger.ts
var winstonLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  }
};

var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  levels: winstonLevels.levels,
  transports: [
    new winston.transports.Console({ /* formato colorizado */ }),
    new winston.transports.File({ filename: "../../logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "../../logs/http.log", level: "http" }),
    new winston.transports.File({ filename: "../../logs/combined.log", level: "debug" })
  ]
});
```

**Variables de entorno usadas:**
- `process.env.LOG_LEVEL` - Nivel de logging (default: "debug")

---

### **Sección 4: Configuración de Base de Datos (Líneas 101-150)**

```javascript
// src/config/database.ts (knexfile)
var knexConfig = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 8889,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "sprintask"
    },
    pool: { min: 2, max: 10 },
    migrations: { tableName: "migrations", directory: "./migrations" }
  },
  production: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: { min: 2, max: 10 }
  }
};

var knex = knex__default.default(knexConfig[process.env.NODE_ENV || "development"]);
```

**Variables de entorno usadas:**
- `process.env.DB_HOST` - Host de MySQL (ej: `localhost` o `pixelycodigo.com`)
- `process.env.DB_PORT` - Puerto de MySQL (ej: `3306` o `8889`)
- `process.env.DB_USER` - Usuario de MySQL
- `process.env.DB_PASSWORD` - Contraseña de MySQL
- `process.env.DB_NAME` - Nombre de la base de datos

---

### **Sección 5: Middlewares y Rutas (Líneas 151-500)**

```javascript
// Middleware de logging HTTP
var httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

// Error handler
var errorHandler = (err, req, res, next) => {
  // Manejo de errores Zod, JWT, custom errors
  // ...
};

// Rutas API
var router = express__default.default.Router();

// Auth routes
router.post("/auth/registro", authController.registro);
router.post("/auth/login", authController.login);
router.post("/auth/refresh-token", authController.refreshToken);
router.post("/auth/logout", authController.logout);
// ... más rutas

// Admin routes
router.get("/admin/clientes", clientesController.findAll);
router.post("/admin/clientes", clientesController.create);
// ... más rutas

// Talent routes
router.get("/talent/dashboard", talentController.getStats);
// ... más rutas
```

---

### **Sección 6: Server Initialization (Líneas 501-550)**

```javascript
// src/server.ts - Entry point principal
dotenv__default.default.config();  // Cargar .env

var app = express__default.default();
var PORT = parseInt(process.env.PORT || "3001", 10);

// Middlewares
app.use(helmet__default.default());           // Security headers
app.use(cors__default.default(corsOptions));  // CORS
app.use(httpLogger);                           // HTTP logging
app.use(express__default.default.json());     // Parse JSON
app.use(express__default.default.urlencoded({ extended: true }));

// Health check (público)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes_default);

// Error handler (debe ir al final)
app.use(errorHandler);

// Configuración de host para producción/desarrollo
var HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
var DISPLAY_HOST = process.env.NODE_ENV === "production" 
  ? (process.env.FRONTEND_URL || "pixelycodigo.com") 
  : "localhost";

// Iniciar servidor
app.listen(PORT, HOST, () => {
  logger.info("🚀 SprinTask API iniciada", {
    port: PORT,
    host: HOST,
    env: process.env.NODE_ENV || "development",
    database: process.env.DB_NAME || "sprintask"
  });
  console.log(`🚀 SprinTask API corriendo en http://${DISPLAY_HOST}:${PORT}`);
  console.log(`📦 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Base de datos: ${process.env.DB_NAME || "sprintask"}`);
  console.log(`📝 Logs disponibles en: apps/api/logs/`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("🛑 Señal SIGTERM recibida, cerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("🛑 Señal SIGINT recibida, cerrando servidor...");
  process.exit(0);
});

module.exports = app;  // Export para Passenger
```

**Variables de entorno usadas:**
- `process.env.PORT` - Puerto del servidor (default: 3001)
- `process.env.NODE_ENV` - 'production' o 'development'
- `process.env.FRONTEND_URL` - Dominio del frontend para logs
- `process.env.DB_NAME` - Nombre de la base de datos

---

## 🔍 PUNTOS CLAVE PARA DEBUGGING

### **1. El archivo NO debe tener código duplicado**

**Verificar:**
```bash
# El archivo debe terminar con:
module.exports = app;
//# sourceMappingURL=server.js.map
```

**Si hay código después de `module.exports`, está corrupto.**

---

### **2. Passenger usa CommonJS**

El archivo está compilado como **CommonJS** (`require()` / `module.exports`), compatible con Passenger/cPanel.

**Error si está en ESM:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

---

### **3. El servidor escucha en `0.0.0.0` en producción**

```javascript
var HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
```

**¿Por qué?** Passenger necesita que el servidor escuche en todas las interfaces.

---

### **4. CORS permite cualquier origen en producción**

```javascript
if (!isDevelopment && !process.env.FRONTEND_URL) {
  return callback(null, true);  // Permite cualquier origen
}
```

**Para restringir:** Agregar `FRONTEND_URL=https://tudominio.com` en `.env`

---

## 📊 VARIABLES DE ENTORNO REQUERIDAS

| Variable | Propósito | Default | Ejemplo |
|----------|-----------|---------|---------|
| `PORT` | Puerto del servidor | `3001` | `3001` |
| `NODE_ENV` | Entorno | `development` | `production` |
| `DB_HOST` | Host MySQL | `localhost` | `pixelycodigo.com` |
| `DB_PORT` | Puerto MySQL | `8889` | `3306` |
| `DB_USER` | Usuario MySQL | `root` | `usuario_cpanel` |
| `DB_PASSWORD` | Contraseña MySQL | `root` | `contraseña_segura` |
| `DB_NAME` | Base de datos | `sprintask` | `usuario_sprintask_db` |
| `FRONTEND_URL` | Dominio frontend | (vacío) | `https://pixelycodigo.com` |
| `JWT_SECRET` | Secreto JWT | `default_secret` | `secreto_seguro` |
| `LOG_LEVEL` | Nivel de logs | `debug` | `info` |

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### **Error: `listen() was called more than once`**

**Causa:** Código duplicado al final del archivo.

**Solución:** El archivo debe terminar inmediatamente después de `module.exports = app;`

---

### **Error: `ERR_REQUIRE_ESM`**

**Causa:** El archivo está en formato ESM pero Passenger espera CommonJS.

**Solución:** Verificar que `package.json` tenga `"type": "commonjs"`

---

### **Error: CORS no permite el origen**

**Causa:** `FRONTEND_URL` no está configurado correctamente.

**Solución:** Agregar `FRONTEND_URL=https://tudominio.com` en `.env`

---

### **Error: No puede conectar a la base de datos**

**Causa:** Variables de entorno incorrectas.

**Solución:** Verificar `.env` tiene las credenciales correctas de MySQL.

---

## 📞 CONTACTO PARA SOPORTE

Si encuentras algún problema con el código:

1. **Verificar que el archivo no tiene código duplicado**
2. **Verificar que `package.json` tiene `"type": "commonjs"`**
3. **Verificar que las variables de entorno están configuradas**
4. **Revisar los logs en `apps/api/logs/`**

---

**Última actualización:** 13 de Marzo, 2026  
**Build:** v17.0 - Legible para Debugging  
**Archivo:** `FTP_DEPLOY/api/server.js` (199 KB, NO minificado)
