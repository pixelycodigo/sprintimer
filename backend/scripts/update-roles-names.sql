-- Actualizar nombres de roles para clarificar la estructura
-- Ejecutar: mysql -u root -p sprintimer < scripts/update-roles-names.sql

-- 1. Cambiar 'admin' -> 'usuarios' (los que gestionan cuentas)
UPDATE roles SET nombre = 'usuarios', descripcion = 'Administrador de cuenta - Gestiona team, clientes y proyectos' WHERE nombre = 'admin';

-- 2. Cambiar 'usuario' -> 'team_member' (miembros del team)
UPDATE roles SET nombre = 'team_member', descripcion = 'Miembro del equipo - Registra tareas y horas' WHERE nombre = 'usuario';

-- 3. Verificar cambios
SELECT * FROM roles ORDER BY nivel;

-- Resultado esperado:
-- id | nombre        | descripcion                                    | nivel
-- 1  | team_member   | Miembro del equipo - Registra tareas y horas   | 1
-- 2  | usuarios      | Administrador de cuenta - Gestiona team...     | 2  
-- 3  | super_admin   | Administrador global del sistema               | 3
