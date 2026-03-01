/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('configuracion_eliminados').del();
  
  // Inserts seed entries
  await knex('configuracion_eliminados').insert([
    { 
      entidad: 'usuario', 
      dias_retencion: 30, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    },
    { 
      entidad: 'admin', 
      dias_retencion: 30, 
      permitido_recuperar: true, 
      requiere_aprobacion: true 
    },
    { 
      entidad: 'cliente', 
      dias_retencion: 60, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    },
    { 
      entidad: 'proyecto', 
      dias_retencion: 90, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    },
    { 
      entidad: 'sprint', 
      dias_retencion: 90, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    },
    { 
      entidad: 'hito', 
      dias_retencion: 90, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    },
    { 
      entidad: 'actividad', 
      dias_retencion: 90, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    },
    { 
      entidad: 'trimestre', 
      dias_retencion: 90, 
      permitido_recuperar: true, 
      requiere_aprobacion: false 
    }
  ]);
};
