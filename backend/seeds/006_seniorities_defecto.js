/**
 * Seed 006: Seniorities por defecto
 * Propósito: Crear niveles de experiencia predeterminados
 */

exports.seed = async function(knex) {
  // Seniorities por defecto
  const seniorities = [
    {
      nombre: 'Trainee',
      descripcion: 'En formación, requiere supervisión constante. 0-6 meses de experiencia.',
      orden: 1,
      color: '#94A3B8', // slate-400
      activo: true,
      creado_por: 1, // super_admin
    },
    {
      nombre: 'Junior',
      descripcion: 'Autonomía limitada, requiere guía en tareas complejas. 0-2 años de experiencia.',
      orden: 2,
      color: '#3B82F6', // blue-500
      activo: true,
      creado_por: 1,
    },
    {
      nombre: 'Semi-Senior',
      descripcion: 'Autonomía moderada, puede trabajar independientemente en tareas conocidas. 2-4 años.',
      orden: 3,
      color: '#8B5CF6', // violet-500
      activo: true,
      creado_por: 1,
    },
    {
      nombre: 'Senior',
      descripcion: 'Autonomía total, puede liderar tareas complejas y mentorizar. 4-7 años.',
      orden: 4,
      color: '#10B981', // emerald-500
      activo: true,
      creado_por: 1,
    },
    {
      nombre: 'Lead',
      descripcion: 'Lidera equipos, toma decisiones técnicas y arquitectónicas. 7+ años de experiencia.',
      orden: 5,
      color: '#F59E0B', // amber-500
      activo: true,
      creado_por: 1,
    },
  ];

  // Insertar solo si no existen
  for (const seniority of seniorities) {
    const exists = await knex('seniorities')
      .where('nombre', seniority.nombre)
      .first();

    if (!exists) {
      await knex('seniorities').insert(seniority);
      console.log(`  ✅ Seniority creado: ${seniority.nombre}`);
    } else {
      console.log(`  ⏭️  Seniority existe: ${seniority.nombre}`);
    }
  }
};
