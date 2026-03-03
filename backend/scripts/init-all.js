/**
 * Script de Inicialización Completa - SprinTask Backend
 * 
 * Este script configura la base de datos desde cero en un nuevo entorno.
 * Equivalente a init-all.sh pero compatible con Windows.
 * 
 * Uso: npm run init-all
 */

require('dotenv').config();
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testMySQLConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function testDatabaseExists() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sprintimer',
    });

    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function initAll() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 Inicialización de SprinTask Backend                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 1. Verificar .env
  console.log('1️⃣  Verificando archivo .env...');
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.log('   ❌ No se encontró el archivo .env');
    console.log('   Copia .env.example a .env y configúralo:');
    console.log('   cp .env.example .env\n');
    process.exit(1);
  }
  console.log('   ✅ Archivo .env encontrado\n');

  // 2. Verificar conexión MySQL
  console.log('2️⃣  Verificando conexión a MySQL...');
  const canConnect = await testMySQLConnection();
  if (!canConnect) {
    console.log('   ❌ No se pudo conectar a MySQL');
    console.log('   Verifica las credenciales en el archivo .env\n');
    process.exit(1);
  }
  console.log('   ✅ Conexión a MySQL exitosa\n');

  // 3. Verificar base de datos
  console.log('3️⃣  Verificando base de datos...');
  const dbExists = await testDatabaseExists();
  if (!dbExists) {
    console.log(`   ❌ La base de datos '${process.env.DB_NAME}' no existe`);
    console.log('   Créala con:');
    console.log(`   CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`);
    process.exit(1);
  }
  console.log(`   ✅ Base de datos '${process.env.DB_NAME}' encontrada\n`);

  // 4. Ejecutar migraciones
  console.log('4️⃣  Ejecutando migraciones...');
  try {
    execSync('npm run migrate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('   ✅ Migraciones ejecutadas correctamente\n');
  } catch (error) {
    console.log('   ❌ Error al ejecutar migraciones\n');
    process.exit(1);
  }

  // 5. Ejecutar seeds
  console.log('5️⃣  Ejecutando seeds...');
  try {
    execSync('npm run seed', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('   ✅ Seeds ejecutados correctamente\n');
  } catch (error) {
    console.log('   ❌ Error al ejecutar seeds\n');
    process.exit(1);
  }

  // 6. Sincronizar base de datos
  console.log('6️⃣  Sincronizando base de datos...');
  try {
    execSync('npm run sync-db', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('   ✅ Base de datos sincronizada\n');
  } catch (error) {
    console.log('   ⚠️  Error en la sincronización (continuando...)\n');
  }

  // 7. Configurar usuarios de prueba
  console.log('7️⃣  Configurando usuarios de prueba...');
  try {
    execSync('npm run setup-test-users', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('   ✅ Usuarios de prueba configurados\n');
  } catch (error) {
    console.log('   ❌ Error al configurar usuarios de prueba\n');
    process.exit(1);
  }

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ✅ ¡Inicialización completada exitosamente!             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('📊 Credenciales de acceso:\n');
  console.log('   Super Admin:');
  console.log('   📧 Email:     superadmin@sprintask.com');
  console.log('   🔑 Contraseña: Admin1234!\n');
  console.log('   Admin:');
  console.log('   📧 Email:     admin@sprintask.com');
  console.log('   🔑 Contraseña: Admin1234!\n');
  console.log('🚀 Para iniciar el servidor:');
  console.log('   npm run dev\n');
}

initAll();
