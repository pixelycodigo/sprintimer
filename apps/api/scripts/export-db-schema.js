#!/usr/bin/env node
/**
 * Script para obtener el modelo de la base de datos MySQL
 * 
 * Uso:
 *   npm run db:schema
 * 
 * Salida:
 *   - docs/plans/modelo_base_datos_schema.sql (CREATE TABLE statements)
 *   - docs/plans/modelo_base_datos_info.json (Información detallada en JSON)
 */

import knex from 'knex';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Configuración manual de Knex
const dbConfig = {
  client: 'mysql2',
  connection: {
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sprintask',
  },
  pool: {
    min: 2,
    max: 10,
  },
};

const db = knex(dbConfig);

async function getDatabaseSchema() {
  console.log('🔍 Obteniendo esquema de la base de datos...\n');

  const database = dbConfig.connection.database;
  
  // Obtener todas las tablas
  const tables = await db('information_schema.tables')
    .select('table_name', 'table_comment', 'engine', 'table_collation')
    .where('table_schema', database)
    .whereNotIn('table_name', ['migrations']); // Excluir tabla de migraciones

  console.log(`📊 Tablas encontradas: ${tables.length}\n`);

  const schema = {
    database,
    generated_at: new Date().toISOString(),
    tables: []
  };

  for (const table of tables) {
    const tableName = table.table_name || table['TABLE_NAME'] || table['table_name'];
    console.log(`📋 Procesando tabla: ${tableName}`);

    // Obtener columnas - usar nombres en mayúsculas para MySQL
    const columns = await db('information_schema.columns')
      .select(
        'COLUMN_NAME as column_name',
        'ORDINAL_POSITION as ordinal_position',
        'COLUMN_DEFAULT as column_default',
        'IS_NULLABLE as is_nullable',
        'DATA_TYPE as data_type',
        'CHARACTER_MAXIMUM_LENGTH as character_maximum_length',
        'NUMERIC_PRECISION as numeric_precision',
        'NUMERIC_SCALE as numeric_scale',
        'COLUMN_TYPE as column_type',
        'COLUMN_KEY as column_key',
        'EXTRA as extra',
        'COLUMN_COMMENT as column_comment'
      )
      .where('TABLE_SCHEMA', database)
      .where('TABLE_NAME', tableName)
      .orderBy('ORDINAL_POSITION');

    // Obtener claves foráneas - usar nombres en mayúsculas
    const foreignKeys = await db.raw(`
      SELECT
        kcu.COLUMN_NAME as column_name,
        kcu.REFERENCED_TABLE_NAME as referenced_table_name,
        kcu.REFERENCED_COLUMN_NAME as referenced_column_name,
        rc.UPDATE_RULE as update_rule,
        rc.DELETE_RULE as delete_rule
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.referential_constraints rc
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      WHERE kcu.TABLE_SCHEMA = ?
        AND kcu.TABLE_NAME = ?
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    `, [database, tableName]);

    // Obtener índices
    const indexes = await db.raw(`
      SHOW INDEX FROM \`${tableName}\`
    `);

    // Obtener CREATE TABLE statement
    const createTable = await db.raw(`SHOW CREATE TABLE \`${tableName}\``);

    schema.tables.push({
      name: tableName,
      comment: table.table_comment || table.TABLE_COMMENT || null,
      engine: table.engine || table.ENGINE || 'InnoDB',
      collation: table.table_collation || table.TABLE_COLLATION || null,
      columns: columns.map(col => ({
        name: col.column_name || col.COLUMN_NAME,
        position: col.ordinal_position || col.ORDINAL_POSITION,
        type: col.column_type || col.COLUMN_TYPE,
        dataType: col.data_type || col.DATA_TYPE,
        nullable: (col.is_nullable || col.IS_NULLABLE) === 'YES',
        default: col.column_default || col.COLUMN_DEFAULT,
        isPrimaryKey: (col.column_key || col.COLUMN_KEY) === 'PRI',
        isForeignKey: (col.column_key || col.COLUMN_KEY) === 'MUL' || (col.column_key || col.COLUMN_KEY) === 'FK',
        isUnique: (col.column_key || col.COLUMN_KEY) === 'UNI',
        autoIncrement: (col.extra || col.EXTRA) === 'auto_increment',
        comment: col.column_comment || col.COLUMN_COMMENT
      })),
      foreignKeys: (foreignKeys[0] || []).map(fk => ({
        column: fk.column_name || fk.COLUMN_NAME,
        referencedTable: fk.referenced_table_name || fk.REFERENCED_TABLE_NAME,
        referencedColumn: fk.referenced_column_name || fk.REFERENCED_COLUMN_NAME,
        onUpdate: fk.update_rule || fk.UPDATE_RULE,
        onDelete: fk.delete_rule || fk.DELETE_RULE
      })),
      indexes: (indexes[0] || [])
        .filter(idx => idx.Key_name !== 'PRIMARY')
        .map(idx => ({
          name: idx.Key_name,
          column: idx.Column_name,
          unique: idx.Non_unique === 0
        })),
      createTable: createTable[0][0]['Create Table']
    });
  }

  return schema;
}

function generateSQL(schema) {
  let sql = `-- ============================================\n`;
  sql += `-- Modelo de Base de Datos - SprinTask SaaS\n`;
  sql += `-- ============================================\n`;
  sql += `-- Generado: ${schema.generated_at}\n`;
  sql += `-- Base de Datos: ${schema.database}\n`;
  sql += `-- ============================================\n\n`;

  sql += `CREATE DATABASE IF NOT EXISTS \`${schema.database}\`;\n`;
  sql += `USE \`${schema.database}\`;\n\n`;

  for (const table of schema.tables) {
    sql += `-- --------------------------------------------\n`;
    sql += `-- Tabla: ${table.name}\n`;
    if (table.comment) {
      sql += `-- Comentario: ${table.comment}\n`;
    }
    sql += `-- --------------------------------------------\n\n`;
    sql += `${table.createTable};\n\n`;
  }

  return sql;
}

function generateMarkdown(schema) {
  let md = `# 🗄️ Modelo de Base de Datos - SprinTask SaaS\n\n`;
  md += `**Generado:** ${new Date(schema.generated_at).toLocaleString('es-ES')}\n`;
  md += `**Base de Datos:** \`${schema.database}\`\n\n`;
  md += `---\n\n`;

  md += `## 📊 Resumen\n\n`;
  md += `| Métrica | Cantidad |\n`;
  md += `|---------|----------|\n`;
  md += `| **Tablas** | ${schema.tables.length} |\n`;
  
  const totalColumns = schema.tables.reduce((sum, t) => sum + t.columns.length, 0);
  md += `| **Columnas Totales** | ${totalColumns} |\n`;
  
  const totalFKs = schema.tables.reduce((sum, t) => sum + t.foreignKeys.length, 0);
  md += `| **Claves Foráneas** | ${totalFKs} |\n\n`;

  md += `---\n\n`;

  md += `## 📋 Tablas\n\n`;

  for (const table of schema.tables) {
    md += `### ${table.name}\n\n`;
    
    if (table.comment) {
      md += `${table.comment}\n\n`;
    }

    md += `#### Columnas\n\n`;
    md += `| # | Columna | Tipo | Nullable | Default | PK | FK | UNI | AI |\n`;
    md += `|---|---------|------|----------|---------|----|----|-----|----|\n`;
    
    for (const col of table.columns) {
      md += `| ${col.position} | \`${col.name}\` | ${col.type} | ${col.nullable ? '✓' : ''} | ${col.default !== null ? col.default : 'NULL'} | ${col.isPrimaryKey ? '✓' : ''} | ${col.isForeignKey ? '✓' : ''} | ${col.isUnique ? '✓' : ''} | ${col.autoIncrement ? '✓' : ''} |\n`;
    }

    if (table.foreignKeys.length > 0) {
      md += `\n#### Claves Foráneas\n\n`;
      md += `| Columna | Tabla Referenciada | Columna | ON UPDATE | ON DELETE |\n`;
      md += `|---------|-------------------|---------|-----------|----------|\n`;
      
      for (const fk of table.foreignKeys) {
        md += `| \`${fk.column}\` | ${fk.referencedTable} | \`${fk.referencedColumn}\` | ${fk.onUpdate} | ${fk.onDelete} |\n`;
      }
    }

    if (table.indexes.length > 0) {
      md += `\n#### Índices\n\n`;
      md += `| Nombre | Columna | Unique |\n`;
      md += `|--------|---------|--------|\n`;
      
      for (const idx of table.indexes) {
        md += `| ${idx.name} | \`${idx.column}\` | ${idx.unique ? '✓' : ''} |\n`;
      }
    }

    md += `\n---\n\n`;
  }

  return md;
}

async function main() {
  try {
    const schema = await getDatabaseSchema();

    // Guardar JSON
    const jsonPath = path.join(__dirname, '..', '..', '..', 'docs', 'plans', 'modelo_base_datos_info.json');
    fs.writeFileSync(jsonPath, JSON.stringify(schema, null, 2));
    console.log(`\n✅ JSON guardado: ${jsonPath}`);

    // Guardar SQL
    const sql = generateSQL(schema);
    const sqlPath = path.join(__dirname, '..', '..', '..', 'docs', 'plans', 'modelo_base_datos_schema.sql');
    fs.writeFileSync(sqlPath, sql);
    console.log(`✅ SQL guardado: ${sqlPath}`);

    // Guardar Markdown
    const md = generateMarkdown(schema);
    const mdPath = path.join(__dirname, '..', '..', '..', 'docs', 'plans', 'modelo_base_datos_auto.md');
    fs.writeFileSync(mdPath, md);
    console.log(`✅ Markdown guardado: ${mdPath}`);

    console.log('\n✨ ¡Esquema exportado exitosamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();
