#!/bin/bash

# ============================================
# Script de Inicialización - SprinTimer Backend
# ============================================
# Este script configura la base de datos desde cero
# en un nuevo entorno de desarrollo o producción.
#
# Uso: ./scripts/init-all.sh
# ============================================

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   🚀 Inicialización de SprinTimer Backend                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ No se encontró el archivo .env"
    echo "   Copia .env.example a .env y configúralo:"
    echo "   cp .env.example .env"
    echo ""
    exit 1
fi

echo "✅ Archivo .env encontrado"
echo ""

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
mysql -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" -e "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ No se pudo conectar a la base de datos"
    echo "   Verifica las credenciales en el archivo .env"
    echo ""
    exit 1
fi

echo "✅ Conexión a la base de datos exitosa"
echo ""

# Verificar que la base de datos existe
echo "🔍 Verificando base de datos '${DB_NAME:-sprintimer}'..."
mysql -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" -e "USE ${DB_NAME:-sprintimer}" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ La base de datos '${DB_NAME:-sprintimer}' no existe"
    echo "   Créala con:"
    echo "   CREATE DATABASE ${DB_NAME:-sprintimer} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo ""
    exit 1
fi

echo "✅ Base de datos '${DB_NAME:-sprintimer}' encontrada"
echo ""

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Error al ejecutar migraciones"
    exit 1
fi

echo "✅ Migraciones ejecutadas correctamente"
echo ""

# Ejecutar seeds
echo "🌱 Ejecutando seeds..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Error al ejecutar seeds"
    exit 1
fi

echo "✅ Seeds ejecutados correctamente"
echo ""

# Sincronizar base de datos (eliminar tablas obsoletas)
echo "🔄 Sincronizando base de datos..."
npm run sync-db

if [ $? -ne 0 ]; then
    echo "⚠️  Error en la sincronización (continuando...)"
fi

echo ""

# Configurar usuarios de prueba
echo "👥 Configurando usuarios de prueba..."
npm run setup-test-users

if [ $? -ne 0 ]; then
    echo "❌ Error al configurar usuarios de prueba"
    exit 1
fi

echo "✅ Usuarios de prueba configurados"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   ✅ ¡Inicialización completada exitosamente!             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Credenciales de acceso:"
echo ""
echo "   Super Admin:"
echo "   📧 Email:     superadmin@sprintimer.com"
echo "   🔑 Contraseña: Admin1234!"
echo ""
echo "   Admin:"
echo "   📧 Email:     admin@sprintimer.com"
echo "   🔑 Contraseña: Admin1234!"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
