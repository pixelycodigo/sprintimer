/**
 * Script para restaurar tablas y columnas eliminadas
 * Ejecutar: node scripts/restore-removed-tables.js
 */

const db = require('../src/config/database');

async function restore() {
  try {
    console.log('RESTAURANDO TABLAS Y COLUMNAS ELIMINADAS\n');
    
    // 1. RESTAURAR COLUMNAS EN USUARIOS
    console.log('1. RESTAURANDO COLUMNAS EN USUARIOS:\n');
    
    await db.schema.table('usuarios', (table) => {
      table.timestamp('token_verificacion_email').nullable();
      table.timestamp('ultimo_login').nullable();
      table.timestamp('ultima_fecha_cambio_password').nullable();
    });
    console.log('  AGREGADAS: token_verificacion_email, ultimo_login, ultima_fecha_cambio_password');
    
    // 2. ACTUALIZAR ultima_fecha_cambio_password con fecha_creacion
    console.log('\n2. ACTUALIZANDO ultima_fecha_cambio_password:\n');
    
    await db('usuarios').update({
      ultima_fecha_cambio_password: db.raw('fecha_creacion')
    });
    console.log('  ACTUALIZADOS: Todos los usuarios con su fecha_creacion');
    
    // 3. RESTAURAR TABLAS
    console.log('\n3. RESTAURANDO TABLAS:\n');
    
    // email_verification_tokens
    await db.schema.createTable('email_verification_tokens', (table) => {
      table.increments('id').primary();
      table.integer('usuario_id').unsigned().notNullable();
      table.string('token', 255).notNullable();
      table.timestamp('expira_en').notNullable();
      table.boolean('usado').defaultTo(false);
      table.timestamp('creado_en').defaultTo(db.fn.now());
      
      table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
      table.index('token');
      table.index('usuario_id');
    });
    console.log('  CREADA: email_verification_tokens');
    
    // password_reset_tokens
    await db.schema.createTable('password_reset_tokens', (table) => {
      table.increments('id').primary();
      table.integer('usuario_id').unsigned().notNullable();
      table.string('token', 255).notNullable();
      table.timestamp('expira_en').notNullable();
      table.boolean('usado').defaultTo(false);
      table.timestamp('creado_en').defaultTo(db.fn.now());
      
      table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
      table.index('token');
      table.index('usuario_id');
    });
    console.log('  CREADA: password_reset_tokens');
    
    // audit_log
    await db.schema.createTable('audit_log', (table) => {
      table.increments('id').primary();
      table.integer('usuario_id').unsigned();
      table.string('accion', 100).notNullable();
      table.string('entidad', 50).notNullable();
      table.integer('entidad_id').unsigned();
      table.json('datos_anteriores').nullable();
      table.json('datos_nuevos').nullable();
      table.string('ip_address', 45).nullable();
      table.string('user_agent', 255).nullable();
      table.timestamp('creado_en').defaultTo(db.fn.now());
      
      table.foreign('usuario_id').references('id').inTable('usuarios').onDelete('SET NULL');
      table.index('usuario_id');
      table.index('entidad');
      table.index('entidad_id');
    });
    console.log('  CREADA: audit_log');
    
    // horas_estimadas_ajuste
    await db.schema.createTable('horas_estimadas_ajuste', (table) => {
      table.increments('id').primary();
      table.integer('actividad_sprint_id').unsigned().notNullable();
      table.decimal('horas_anteriores', 5, 2).notNullable();
      table.decimal('horas_nuevas', 5, 2).notNullable();
      table.decimal('diferencia', 5, 2).notNullable();
      table.string('motivo', 255).nullable();
      table.integer('ajustado_por').unsigned();
      table.timestamp('fecha_ajuste').defaultTo(db.fn.now());
      
      table.foreign('actividad_sprint_id').references('id').inTable('actividades_sprints').onDelete('CASCADE');
      table.foreign('ajustado_por').references('id').inTable('usuarios').onDelete('SET NULL');
      table.index('actividad_sprint_id');
    });
    console.log('  CREADA: horas_estimadas_ajuste');
    
    // 4. VERIFICAR ESTRUCTURA
    console.log('\n4. VERIFICANDO ESTRUCTURA:\n');
    
    const columnas = await db.raw('SHOW COLUMNS FROM usuarios');
    console.log('COLUMNAS EN USUARIOS:');
    columnas[0].forEach(col => {
      if (['token_verificacion_email', 'ultimo_login', 'ultima_fecha_cambio_password'].includes(col.Field)) {
        console.log('  + ' + col.Field + ' (' + col.Type + ')');
      }
    });
    
    const tablas = await db.raw('SHOW TABLES');
    const nuevasTablas = ['email_verification_tokens', 'password_reset_tokens', 'audit_log', 'horas_estimadas_ajuste'];
    const nombresTablas = tablas[0].map(row => Object.values(row)[0]);
    
    console.log('\nTABLAS RESTAURADAS:');
    nuevasTablas.forEach(t => {
      if (nombresTablas.includes(t)) {
        console.log('  + ' + t);
      }
    });
    
    // 5. VERIFICAR DATOS
    console.log('\n5. VERIFICANDO DATOS:\n');
    
    const usuarios = await db('usuarios')
      .select('id', 'nombre', 'fecha_creacion', 'ultima_fecha_cambio_password')
      .limit(5);
    
    console.log('ULTIMA_FECHA_CAMBIO_PASSWORD (primeros 5 usuarios):');
    usuarios.forEach(u => {
      console.log('  - ' + u.nombre + ': ' + u.ultima_fecha_cambio_password);
    });
    
    console.log('\nRESTAURACION COMPLETADA\n');
    
    await db.destroy();
  } catch (error) {
    console.error('Error en restauracion:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

restore();
