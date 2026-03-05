export enum Rol {
  SUPER_ADMIN = 'super_admin',
  ADMINISTRADOR = 'administrador',
  CLIENTE = 'cliente',
  TALENT = 'talent',
}

export const ROLES_LABELS: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: 'Super Admin',
  [Rol.ADMINISTRADOR]: 'Administrador',
  [Rol.CLIENTE]: 'Cliente',
  [Rol.TALENT]: 'Talent',
};

export const ROLES_COLORS: Record<Rol, string> = {
  [Rol.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
  [Rol.ADMINISTRADOR]: 'bg-blue-100 text-blue-800',
  [Rol.CLIENTE]: 'bg-green-100 text-green-800',
  [Rol.TALENT]: 'bg-amber-100 text-amber-800',
};
