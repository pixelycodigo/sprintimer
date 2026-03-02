/**
 * Script de Sincronización y Depuración de Base de Datos
 * 
 * Este script sincroniza la base de datos con el estado actual del proyecto:
 * - Elimina tablas obsoletas
 * - Actualiza la tabla knex_migrations
 * - Verifica integridad de datos
 * 
 * Uso: npm run sync-db
 */

require('dotenv').config();
const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

// Tablas obsoletas que deben eliminarse
const TABLAS_OBSOLETAS = [
  'permisos',
  'rol_permisos',
  'planes',
  'suscripciones'
];

// Migraciones obsoletas que deben eliminarse del registro
const MIGRACIONES_OBSOLETAS = [
  '025_create_permisos_table.js',
  '026_create_rol_permisos_table.js',
  '027_create_planes_table.js',
  '028_create_suscripciones_table.js'
];

async function syncDatabase() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🔄 Sincronización de Base de Datos                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣  Verificando conexión...');
    await db.raw('SELECT 1');
    console.log('   ✅ Conexión exitosa\n');

    // 2. Eliminar tablas obsoletas
    console.log('2️⃣  Eliminando tablas obsoletas...');
    
    // Deshabilitar verificación de claves foráneas temporalmente
    await db.raw('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const tabla of TABLAS_OBSOLETAS) {
      try {
        const exists = await db.schema.hasTable(tabla);
        if (exists) {
          await db.schema.dropTable(tabla);
          console.log(`   ✅ ${tabla}: Eliminada`);
        } else {
          console.log(`   ⏭️  ${tabla}: No existe (ya fue eliminada)`);
        }
      } catch (error) {
        console.log(`   ❌ ${tabla}: Error - ${error.message}`);
      }
    }
    
    // Rehabilitar verificación de claves foráneas
    await db.raw('SET FOREIGN_KEY_CHECKS = 1');
    console.log('');

    // 3. Limpiar registro de migraciones obsoletas
    console.log('3️⃣  Limpiando registro de migraciones obsoletas...');
    for (const migracion of MIGRACIONES_OBSOLETAS) {
      const deleted = await db('knex_migrations')
        .where('name', migracion)
        .del();
      
      if (deleted > 0) {
        console.log(`   ✅ ${migracion}: Registro eliminado`);
      } else {
        console.log(`   ⏭️  ${migracion}: No estaba registrada`);
      }
    }
    console.log('');

    // 4. Verificar integridad de roles
    console.log('4️⃣  Verificando integridad de roles...');
    const roles = await db('roles').select('*');
    const rolesEsperados = ['team_member', 'admin', 'super_admin'];
    
    for (const rolEsperado of rolesEsperados) {
      const existe = roles.some(r => r.nombre === rolEsperado);
      if (existe) {
        console.log(`   ✅ Rol '${rolEsperado}': Existe`);
      } else {
        console.log(`   ❌ Rol '${rolEsperado}': FALTA - Ejecuta: npm run seed`);
      }
    }
    console.log('');

    // 5. Verificar usuarios sin rol válido
    console.log('5️⃣  Verificando integridad de usuarios...');
    const usuariosSinRol = await db('usuarios')
      .leftJoin('roles', 'usuarios.rol_id', 'roles.id')
      .whereNull('roles.id')
      .count('usuarios.id as count');
    
    const count = parseInt(usuariosSinRol[0].count);
    if (count > 0) {
      console.log(`   ⚠️  ${count} usuarios con rol inválido encontrados`);
      console.log(`   💡 Ejecuta: npm run setup-test-users para corregir`);
    } else {
      console.log(`   ✅ Todos los usuarios tienen rol válido`);
    }
    console.log('');

    // 6. Mostrar resumen de tablas
    console.log('6️⃣  Resumen de tablas en la base de datos...');
    const tablas = await db.raw(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      ORDER BY TABLE_NAME
    `);
    
    console.log(`   📊 Total de tablas: ${tablas[0].length}`);
    console.log('   Tablas:');
    tablas[0].forEach(t => {
      if (TABLAS_OBSOLETAS.includes(t.TABLE_NAME)) {
        console.log(`      ❌ ${t.TABLE_NAME} (obsoleta - debería eliminarse)`);
      } else {
        console.log(`      ✅ ${t.TABLE_NAME}`);
      }
    });
    console.log('');

    // 7. Mostrar migraciones registradas
    console.log('7️⃣  Migraciones registradas...');
    const migraciones = await db('knex_migrations').select('name', 'batch');
    console.log(`   📊 Total de migraciones: ${migraciones.length}`);
    
    const migracionesFaltantes = [];
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();
    
    for (const file of migrationFiles) {
      const existe = migraciones.some(m => m.name === file);
      if (!existe) {
        migracionesFaltantes.push(file);
      }
    }
    
    if (migracionesFaltantes.length > 0) {
      console.log(`   ⚠️  ${migracionesFaltantes.length} migraciones sin ejecutar:`);
      migracionesFaltantes.forEach(m => console.log(`      - ${m}`));
      console.log(`   💡 Ejecuta: npm run migrate`);
    } else {
      console.log(`   ✅ Todas las migraciones están al día`);
    }
    console.log('');

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Sincronización completada exitosamente!              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    await db.destroy();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error.message);
    console.error(error.stack);
    await db.destroy();
    process.exit(1);
  }
}

syncDatabase();
