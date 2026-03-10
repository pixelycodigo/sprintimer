import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Verificar si 'asignacion' ya existe en el enum
  const result = await knex.raw(`
    SELECT COLUMN_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'eliminados' 
    AND COLUMN_NAME = 'item_tipo'
  `);

  const columnType = result[0][0]?.COLUMN_TYPE || '';
  
  if (columnType.includes('asignacion')) {
    console.log('✅ El enum ya incluye "asignacion"');
    return;
  }

  // Modificar el enum para agregar 'asignacion'
  await knex.raw(`
    ALTER TABLE eliminados 
    MODIFY COLUMN item_tipo ENUM(
      'cliente', 'proyecto', 'actividad', 'talent', 'perfil', 
      'seniority', 'divisa', 'costo_por_hora', 'asignacion', 
      'sprint', 'tarea'
    ) NOT NULL
  `);

  console.log('✅ Enum actualizado: agregado "asignacion"');
}

export async function down(knex: Knex): Promise<void> {
  // Revertir el enum (quitar 'asignacion')
  await knex.raw(`
    ALTER TABLE eliminados 
    MODIFY COLUMN item_tipo ENUM(
      'cliente', 'proyecto', 'actividad', 'talent', 'perfil', 
      'seniority', 'divisa', 'costo_por_hora', 
      'sprint', 'tarea'
    ) NOT NULL
  `);

  console.log('⚠️ Enum revertido: removido "asignacion"');
}
