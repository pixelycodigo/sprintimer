/**
 * Script para eliminar tablas y columnas obsoletas de la base de datos
 * Ejecutar: node scripts/cleanup-obsolete-tables.js
 */

const db = require('../src/config/database');

async function cleanup() {
  try {
    console.log('LIMPIEZA DE BASE DE DATOS - Tablas y Columnas Obsoletas\n');
    
    // Deshabilitar restricciones de clave foránea
    await db.raw('SET FOREIGN_KEY_CHECKS = 0');
    
    const operaciones = {
      tablasEliminadas: [],
      columnasEliminadas: [],
      errores: []
    };
    
    // 1. ELIMINAR TABLAS OBSOLETAS
    const tablasObsoletas = [
      { nombre: 'usuarios_proyectos', razon: 'Reemplazada por team_projects' },
      { nombre: 'permisos', razon: 'Sistema de permisos no implementado' },
      { nombre: 'rol_permisos', razon: 'Sistema de permisos no implementado' },
      { nombre: 'planes', razon: 'Funcionalidad SaaS no implementada' },
      { nombre: 'suscripciones', razon: 'Funcionalidad SaaS no implementada' },
      { nombre: 'audit_log', razon: 'Auditoria no implementada' },
      { nombre: 'horas_estimadas_ajuste', razon: 'Ajuste de horas no implementado' },
      { nombre: 'email_verification_tokens', razon: 'Verificacion por email no implementada' },
      { nombre: 'password_reset_tokens', razon: 'Recuperacion por email no implementada' },
    ];
    
    console.log('ELIMINANDO TABLAS OBSOLETAS:\n');
    
    for (const tabla of tablasObsoletas) {
      try {
        const existe = await db.schema.hasTable(tabla.nombre);
        if (existe) {
          const count = await db(tabla.nombre).count('* as total').first();
          const total = parseInt(count.total);
          
          if (total > 0) {
            console.log('  ADVERTENCIA: ' + tabla.nombre + ' tiene ' + total + ' registros');
          }
          
          await db.schema.dropTable(tabla.nombre);
          console.log('  ELIMINADA: ' + tabla.nombre + ' - ' + tabla.razon);
          operaciones.tablasEliminadas.push(tabla.nombre);
        } else {
          console.log('  SALTED: ' + tabla.nombre + ' (no existe)');
        }
      } catch (error) {
        console.log('  ERROR: ' + tabla.nombre + ' - ' + error.message);
        operaciones.errores.push({ tabla: tabla.nombre, error: error.message });
      }
    }
    
    // 2. ELIMINAR COLUMNAS OBSOLETAS
    console.log('\nELIMINANDO COLUMNAS OBSOLETAS:\n');
    
    const columnasObsoletas = [
      { tabla: 'usuarios', columna: 'perfil_en_proyecto', razon: 'Reemplazado por team_projects.perfil_team_id' },
      { tabla: 'usuarios', columna: 'token_verificacion_email', razon: 'Email no implementado' },
      { tabla: 'usuarios', columna: 'ultimo_login', razon: 'No se actualiza' },
      { tabla: 'usuarios', columna: 'ultima_fecha_cambio_password', razon: 'No se usa' },
    ];
    
    for (const item of columnasObsoletas) {
      try {
        const tablaExiste = await db.schema.hasTable(item.tabla);
        if (!tablaExiste) {
          console.log('  SALTED: ' + item.tabla + '.' + item.columna + ' (tabla no existe)');
          continue;
        }
        
        const columnas = await db.raw('SHOW COLUMNS FROM ' + item.tabla);
        const existe = columnas[0].some(col => col.Field === item.columna);
        
        if (existe) {
          await db.schema.table(item.tabla, (table) => {
            table.dropColumn(item.columna);
          });
          console.log('  ELIMINADA: ' + item.tabla + '.' + item.columna + ' - ' + item.razon);
          operaciones.columnasEliminadas.push(item.tabla + '.' + item.columna);
        } else {
          console.log('  SALTED: ' + item.tabla + '.' + item.columna + ' (no existe)');
        }
      } catch (error) {
        console.log('  ERROR: ' + item.tabla + '.' + item.columna + ' - ' + error.message);
        operaciones.errores.push({ columna: item.tabla + '.' + item.columna, error: error.message });
      }
    }
    
    await db.raw('SET FOREIGN_KEY_CHECKS = 1');
    
    // 3. RESUMEN
    console.log('\n' + '='.repeat(60));
    console.log('LIMPIEZA COMPLETADA\n');
    
    console.log('RESUMEN:');
    console.log('  Tablas eliminadas: ' + operaciones.tablasEliminadas.length);
    operaciones.tablasEliminadas.forEach(t => console.log('    - ' + t));
    
    console.log('\n  Columnas eliminadas: ' + operaciones.columnasEliminadas.length);
    operaciones.columnasEliminadas.forEach(c => console.log('    - ' + c));
    
    if (operaciones.errores.length > 0) {
      console.log('\n  Errores: ' + operaciones.errores.length);
      operaciones.errores.forEach(e => {
        if (e.tabla) {
          console.log('    - ' + e.tabla + ': ' + e.error);
        } else {
          console.log('    - ' + e.columna + ': ' + e.error);
        }
      });
    }
    
    console.log('\nBase de datos optimizada\n');
    
    await db.destroy();
  } catch (error) {
    console.error('Error en limpieza:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

cleanup();
