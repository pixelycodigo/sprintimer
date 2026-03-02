/**
 * Script para revertir nombres de perfiles (con guiones)
 * 
 * Cambia:
 * - 'UX UI Designer' → 'ux-ui-designer'
 * - 'Frontend Dev' → 'frontend-dev'
 * - etc.
 * 
 * Uso: node scripts/revertir-nombres-perfiles.js
 */

require('dotenv').config();
const db = require('../src/config/database');

async function revertirNombresPerfiles() {
  try {
    console.log('🔄 Revertiendo nombres de perfiles (con guiones)...\n');

    // Obtener todos los perfiles
    const perfiles = await db('perfiles_team').select('id', 'nombre');

    for (const perfil of perfiles) {
      // Convertir nombre: 'UX UI Designer' → 'ux-ui-designer'
      const nuevoNombre = perfil.nombre
        .toLowerCase()
        .split(' ')
        .filter(w => w.length > 0)
        .join('-');

      await db('perfiles_team')
        .where('id', perfil.id)
        .update({ nombre: nuevoNombre });

      console.log(`   ✅ ${perfil.nombre} → ${nuevoNombre}`);
    }

    console.log('\n✨ Nombres de perfiles revertidos exitosamente\n');
    await db.destroy();
  } catch (error) {
    console.error('❌ Error al revertir perfiles:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

revertirNombresPerfiles();
