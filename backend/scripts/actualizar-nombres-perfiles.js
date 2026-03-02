/**
 * Script para actualizar nombres de perfiles (quitar guiones)
 * 
 * Cambia:
 * - 'ux-ui-designer' → 'UX UI Designer'
 * - 'frontend-dev' → 'Frontend Dev'
 * - etc.
 * 
 * Uso: node scripts/actualizar-nombres-perfiles.js
 */

require('dotenv').config();
const db = require('../src/config/database');

async function actualizarNombresPerfiles() {
  try {
    console.log('🔄 Actualizando nombres de perfiles...\n');

    // Obtener todos los perfiles
    const perfiles = await db('perfiles_team').select('id', 'nombre');

    for (const perfil of perfiles) {
      // Convertir nombre: 'ux-ui-designer' → 'UX UI Designer'
      const nuevoNombre = perfil.nombre
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      await db('perfiles_team')
        .where('id', perfil.id)
        .update({ nombre: nuevoNombre });

      console.log(`   ✅ ${perfil.nombre} → ${nuevoNombre}`);
    }

    console.log('\n✨ Nombres de perfiles actualizados exitosamente\n');
    await db.destroy();
  } catch (error) {
    console.error('❌ Error al actualizar perfiles:', error.message);
    await db.destroy();
    process.exit(1);
  }
}

actualizarNombresPerfiles();
