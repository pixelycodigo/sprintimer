/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('monedas').del();
  
  // Inserts seed entries
  await knex('monedas').insert([
    { 
      id: 1, 
      codigo: 'PEN', 
      simbolo: 'S/', 
      nombre: 'Soles Peruanos', 
      activo: true 
    },
    { 
      id: 2, 
      codigo: 'USD', 
      simbolo: '$', 
      nombre: 'Dólares Americanos', 
      activo: true 
    },
    { 
      id: 3, 
      codigo: 'EUR', 
      simbolo: '€', 
      nombre: 'Euros', 
      activo: true 
    }
  ]);
};
