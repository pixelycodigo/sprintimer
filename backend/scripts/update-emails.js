/**
 * Script para actualizar correos de @sprintimer.com a @sprintask.com
 * Ejecutar: node scripts/update-emails.js
 */

const db = require('../src/config/database');

async function updateEmails() {
  try {
    console.log('=== ACTUALIZANDO CORREOS ELECTRONICOS ===\n');
    console.log('Cambiando: @sprintimer.com -> @sprintask.com\n');
    
    // 1. Usuarios
    console.log('1. ACTUALIZANDO USUARIOS:');
    
    const usuariosAntes = await db('usuarios')
      .where('email', 'like', '%@sprintimer.com')
      .count('* as total')
      .first();
    
    console.log('   Correos por actualizar: ' + usuariosAntes.total);
    
    const usuariosActualizados = await db('usuarios')
      .where('email', 'like', '%@sprintimer.com')
      .update({
        email: db.raw('REPLACE(email, "@sprintimer.com", "@sprintask.com")')
      });
    
    console.log('   Usuarios actualizados: ' + usuariosActualizados + '\n');
    
    // 2. Tabla eliminados
    console.log('2. ACTUALIZANDO TABLA ELIMINADOS:');
    
    try {
      const eliminados = await db('eliminados')
        .where('datos_originales', 'like', '%@sprintimer.com%')
        .select('id', 'entidad', 'datos_originales');
      
      console.log('   Registros encontrados: ' + eliminados.length);
      
      for (const registro of eliminados) {
        const datosOriginales = JSON.parse(registro.datos_originales);
        
        if (datosOriginales.email) {
          datosOriginales.email = datosOriginales.email.replace('@sprintimer.com', '@sprintask.com');
          
          await db('eliminados')
            .where('id', registro.id)
            .update({ datos_originales: JSON.stringify(datosOriginales) });
          
          console.log('   ✅ ' + registro.entidad + ' ID ' + registro.id + ': ' + datosOriginales.email);
        }
      }
    } catch (error) {
      console.log('   No se pudo actualizar (tabla vacía o no existe)');
    }
    
    // 3. Verificación
    console.log('\n3. VERIFICACION:');
    
    const totalUsuarios = await db('usuarios').count('* as total').first();
    const conSprintask = await db('usuarios')
      .where('email', 'like', '%@sprintask.com')
      .count('* as total')
      .first();
    const conSprintimer = await db('usuarios')
      .where('email', 'like', '%@sprintimer.com')
      .count('* as total')
      .first();
    
    console.log('   Total usuarios: ' + totalUsuarios.total);
    console.log('   Con @sprintask.com: ' + conSprintask.total);
    console.log('   Con @sprintimer.com: ' + conSprintimer.total);
    
    // 4. Listar usuarios actualizados
    console.log('\n4. USUARIOS ACTUALIZADOS:');
    
    const usuarios = await db('usuarios')
      .select('id', 'nombre', 'email')
      .where('email', 'like', '%@sprintask.com')
      .orderBy('nombre');
    
    usuarios.forEach(u => {
      console.log('   ✅ ' + u.nombre + ': ' + u.email);
    });
    
    console.log('\n✅ ACTUALIZACION COMPLETADA\n');
    
    await db.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    await db.destroy();
    process.exit(1);
  }
}

updateEmails();
