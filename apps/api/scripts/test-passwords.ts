import bcrypt from 'bcrypt';

async function testPasswords() {
  const adminPassword = 'Admin1234!';
  const clientePassword = 'Cliente123!';
  const storedHash = '$2b$10$Cd.lkdbT6AZpahBbJu5.G.XZBbWo7z.ikzL58JB3P1sGVP8fhY7Aq';
  
  console.log('🔐 Test de contraseñas:\n');
  
  // Test Admin1234!
  const adminMatch = await bcrypt.compare(adminPassword, storedHash);
  console.log(`Admin1234! vs hash almacenado: ${adminMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  
  // Test Cliente123!
  const clienteMatch = await bcrypt.compare(clientePassword, storedHash);
  console.log(`Cliente123! vs hash almacenado: ${clienteMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  
  // Generar nuevo hash para Admin1234!
  const newAdminHash = await bcrypt.hash(adminPassword, 10);
  console.log(`\n📝 Nuevo hash para Admin1234!:`);
  console.log(`   ${newAdminHash}`);
  
  // Verificar el nuevo hash
  const verifyNewHash = await bcrypt.compare(adminPassword, newAdminHash);
  console.log(`\n✅ Verificación nuevo hash: ${verifyNewHash ? 'CORRECTA' : 'INCORRECTA'}`);
  
  process.exit(0);
}

testPasswords();
