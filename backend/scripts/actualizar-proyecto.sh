#!/bin/bash

# Script de Actualización - SprinTask
# Fecha: 3 de Marzo, 2026
# Uso: ./scripts/actualizar-proyecto.sh

echo "🚀 Iniciando Actualización del Proyecto..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar desde el directorio backend"
    exit 1
fi

# Paso 1: Instalar dependencias
echo "📦 Paso 1: Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del backend"
    exit 1
fi
echo "✅ Dependencias del backend instaladas"
echo ""

# Paso 2: Ir a frontend e instalar dependencias
echo "📦 Paso 2: Instalando dependencias del frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del frontend"
    exit 1
fi
echo "✅ Dependencias del frontend instaladas"
cd ../backend
echo ""

# Paso 3: Ejecutar migraciones
echo "🔧 Paso 3: Ejecutando migraciones..."
npx knex migrate:latest
if [ $? -ne 0 ]; then
    echo "❌ Error al ejecutar migraciones"
    exit 1
fi
echo "✅ Migraciones ejecutadas"
echo ""

# Paso 4: Importar base de datos (si existe el backup)
BACKUP_FILE="database_backup_2026-03-03-actualizado.json"
if [ -f "$BACKUP_FILE" ]; then
    echo "💾 Paso 4: Importando base de datos..."
    node scripts/sync-db.js "$BACKUP_FILE"
    if [ $? -ne 0 ]; then
        echo "⚠️  Error al importar base de datos (puede continuar)"
    else
        echo "✅ Base de datos importada"
    fi
    echo ""
else
    echo "⚠️  Archivo de backup no encontrado: $BACKUP_FILE"
    echo "   Saltando importación de base de datos..."
    echo ""
fi

# Paso 5: Verificar actualización
echo "✅ Paso 5: Verificando actualización..."
node -e "
const db = require('./src/config/database');
(async () => {
  let errores = 0;
  
  // Verificar migraciones
  const migrations = await db('knex_migrations').count('* as total').first();
  if (migrations.total >= 55) {
    console.log('✅ Migraciones:', migrations.total);
  } else {
    console.log('❌ Migraciones:', migrations.total, '(esperado: 55+)');
    errores++;
  }
  
  // Verificar seniorities
  const seniorities = await db('seniorities').count('* as total').first();
  if (seniorities.total === 5) {
    console.log('✅ Seniorities:', seniorities.total);
  } else {
    console.log('❌ Seniorities:', seniorities.total, '(esperado: 5)');
    errores++;
  }
  
  // Verificar usuarios
  const usuarios = await db('usuarios').count('* as total').first();
  if (usuarios.total >= 13) {
    console.log('✅ Usuarios:', usuarios.total);
  } else {
    console.log('❌ Usuarios:', usuarios.total, '(esperado: 13+)');
    errores++;
  }
  
  // Verificar costos
  const costos = await db('costos_por_hora')
    .whereNull('usuario_id')
    .count('* as total')
    .first();
  if (costos.total >= 8) {
    console.log('✅ Costos disponibles:', costos.total);
  } else {
    console.log('❌ Costos disponibles:', costos.total, '(esperado: 8+)');
    errores++;
  }
  
  await db.destroy();
  
  if (errores > 0) {
    console.log('');
    console.log('⚠️  Hay', errores, 'errores. Revisar INSTRUCCIONES-ACTUALIZACION.md');
    process.exit(1);
  } else {
    console.log('');
    console.log('✅ Verificación completada exitosamente');
  }
})()
"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Verificación fallida"
    exit 1
fi

echo ""
echo "🎉 ¡Actualización Completada Exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. cd ../frontend"
echo "   2. npm run dev"
echo "   3. Abrir http://localhost:5173"
echo "   4. Probar creación de integrante con seniority"
echo ""
