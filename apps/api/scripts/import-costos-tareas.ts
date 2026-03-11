import knex from 'knex';
import knexConfig from '../database/knexfile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = knex(knexConfig.development);

const seedFilePath = path.resolve(__dirname, '../../../database/seed-costos-tareas.sql');

async function runSeed() {
  try {
    console.log('📦 Importando datos de costos_por_hora y tareas...\n');
    
    // Leer archivo SQL
    let sql = fs.readFileSync(seedFilePath, 'utf-8');
    
    // Remover comentarios
    sql = sql.replace(/-- ================================================================/g, '');
    sql = sql.replace(/-- .*$/gm, '');
    sql = sql.replace(/^\s*$/gm, '\n');
    
    // Dividir por statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.includes('INSERT INTO'));
    
    console.log(`🚀 Ejecutando ${statements.length} statements...\n`);
    
    let costosCount = 0;
    let tareasCount = 0;
    
    for (const statement of statements) {
      try {
        await db.raw(statement);
        if (statement.includes('costos_por_hora')) {
          costosCount++;
          process.stdout.write('C');
        } else if (statement.includes('tareas')) {
          tareasCount++;
          process.stdout.write('T');
        }
      } catch (err: any) {
        console.error(`\n❌ Error: ${err.message.substring(0, 100)}`);
      }
    }
    
    console.log(`\n\n✅ Seed completado!`);
    console.log(`   Costos por hora insertados: ${costosCount}`);
    console.log(`   Tareas insertadas: ${tareasCount}`);
    
    // Verificar datos
    const costosResult: any = await db('costos_por_hora').count('* as count').first();
    const tareasResult: any = await db('tareas').count('* as count').first();
    
    console.log(`\n📊 Verificación:`);
    console.log(`   costos_por_hora: ${(costosResult as any)?.count ?? 0} registros`);
    console.log(`   tareas: ${(tareasResult as any)?.count ?? 0} registros`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error ejecutando seed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runSeed();
