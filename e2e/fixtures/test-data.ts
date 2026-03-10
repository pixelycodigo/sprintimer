/**
 * Datos de prueba para SprinTask SaaS
 * Datos realistas que simulan usuarios reales
 */

// Timestamp único para cada ejecución de tests
export const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

// Emails de testing (no usar admin ni superadmin)
export const testEmails = {
  cliente: `test.cliente.${timestamp}@sprintask.com`,
  talent: `test.talent.${timestamp}@sprintask.com`,
  admin: `test.admin.${timestamp}@sprintask.com`,
};

// Datos realistas para Cliente
export const clienteData = {
  nombre: `Test Cliente ${timestamp}`,
  empresa: `Test Empresa ${timestamp} S.A.`,
  email: testEmails.cliente,
  cargo: 'Gerente de Proyecto',
  pais: 'Perú',
  celular: '+51 999 999 999',
  telefono: '(01) 999-9999',
  anexo: '1234',
  password: 'Cliente1234!',
};

// Datos realistas para Talent
export const talentData = {
  nombre: `Test Talent ${timestamp}`,
  apellido: `Apellido ${timestamp}`,
  email: testEmails.talent,
  perfil: 'Desarrollador Full Stack',
  seniority: 'Semi-Senior',
  password: 'Talent1234!',
  costoHora: 50,
};

// Datos realistas para Proyecto
export const proyectoData = {
  nombre: `Test Proyecto ${timestamp}`,
  descripcion: `Proyecto de prueba creado automáticamente para testing - ${timestamp}`,
  modalidad: 'ad-hoc',
  formatoHoras: 'minutos',
};

// Datos realistas para Actividad
export const actividadData = {
  nombre: `Test Actividad ${timestamp}`,
  descripcion: `Actividad de prueba para testing - ${timestamp}`,
  horasEstimadas: 40,
};

// Credenciales de usuarios existentes (NO eliminar)
export const existingUsers = {
  superadmin: {
    email: 'superadmin@sprintask.com',
    password: 'Admin1234!',
  },
  admin: {
    email: 'admin@sprintask.com',
    password: 'Admin1234!',
  },
  // Talents existentes en la BD para testing
  // Nota: La contraseña real está hasheada en la BD
  // Usamos 'password' que es el default del seed
  talent: {
    email: 'carlos.mendoza@sprintask.com',
    password: 'password',
  },
};

// Passwords para testing
export const passwords = {
  debil: '123',
  fuerte: 'Test1234!',
  sinMayuscula: 'test1234!',
  sinMinuscula: 'TEST1234!',
  sinNumero: 'Testabcd!',
};
