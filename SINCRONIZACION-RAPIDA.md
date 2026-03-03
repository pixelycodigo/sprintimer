# 🔄 Sincronización Rápida - SprinTimer

**Para sincronizar entre computadoras:**

---

## **Computadora de Origen (Exportar):**

```bash
cd /path/to/sprintimer/backend
node scripts/export-db.js
```

**Resultado:**
- ✅ Crea: `backend/database_backup_YYYY-MM-DD.json`
- ✅ Copia este archivo a la otra computadora (USB, Google Drive, etc.)

---

## **Computadora de Destino (Importar):**

```bash
cd /path/to/sprintimer/backend
node scripts/sync-db.js database_backup_YYYY-MM-DD.json
```

**Qué hace:**
1. ✅ Ejecuta migraciones (actualiza schema)
2. ✅ Importa datos
3. ✅ Verifica integridad

---

## **Verificar:**

```bash
# Backend
cd backend && npm run dev
# http://localhost:3500/api/health

# Frontend
cd ../frontend && npm run dev
# http://localhost:5173
```

---

## **Archivos para Llevar:**

1. ✅ `backend/database_backup_YYYY-MM-DD.json` (83 KB)
2. ✅ `SINCRONIZACION-PARA-IA.md` (guía completa)

---

**¡Listo!**
