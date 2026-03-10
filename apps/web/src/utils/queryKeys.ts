/**
 * Query Keys Factory para centralizar las keys de TanStack Query
 * 
 * Uso:
 *   queryKey: queryKeys.usuarios.list()
 *   queryKey: queryKeys.usuarios.byId(id)
 *   queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.all() })
 */

export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Super Admin
  usuarios: {
    all: () => ['super-admin', 'usuarios'] as const,
    list: () => [...queryKeys.usuarios.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.usuarios.all(), 'byId', id] as const,
  },

  // Admin - Clientes
  clientes: {
    all: () => ['admin', 'clientes'] as const,
    list: () => [...queryKeys.clientes.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.clientes.all(), 'byId', id] as const,
  },

  // Admin - Talents
  talents: {
    all: () => ['admin', 'talents'] as const,
    list: () => [...queryKeys.talents.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.talents.all(), 'byId', id] as const,
  },

  // Admin - Proyectos
  proyectos: {
    all: () => ['admin', 'proyectos'] as const,
    list: () => [...queryKeys.proyectos.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.proyectos.all(), 'byId', id] as const,
    byCliente: (clienteId: number) => [...queryKeys.proyectos.all(), 'byCliente', clienteId] as const,
  },

  // Admin - Actividades
  actividades: {
    all: () => ['admin', 'actividades'] as const,
    list: () => [...queryKeys.actividades.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.actividades.all(), 'byId', id] as const,
    byProyecto: (proyectoId: number) => [...queryKeys.actividades.all(), 'byProyecto', proyectoId] as const,
  },

  // Admin - Perfiles
  perfiles: {
    all: () => ['admin', 'perfiles'] as const,
    list: () => [...queryKeys.perfiles.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.perfiles.all(), 'byId', id] as const,
  },

  // Admin - Seniorities
  seniorities: {
    all: () => ['admin', 'seniorities'] as const,
    list: () => [...queryKeys.seniorities.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.seniorities.all(), 'byId', id] as const,
  },

  // Admin - Divisas
  divisas: {
    all: () => ['admin', 'divisas'] as const,
    list: () => [...queryKeys.divisas.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.divisas.all(), 'byId', id] as const,
  },

  // Admin - Costo por Hora
  costoPorHora: {
    all: () => ['admin', 'costo-por-hora'] as const,
    list: () => [...queryKeys.costoPorHora.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.costoPorHora.all(), 'byId', id] as const,
  },

  // Admin - Asignaciones
  asignaciones: {
    all: () => ['admin', 'asignaciones'] as const,
    list: () => [...queryKeys.asignaciones.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.asignaciones.all(), 'byId', id] as const,
  },

  // Admin - Eliminados
  eliminados: {
    all: () => ['admin', 'eliminados'] as const,
    list: () => [...queryKeys.eliminados.all(), 'list'] as const,
  },

  // Dashboard
  dashboard: {
    admin: () => ['dashboard', 'admin'] as const,
    cliente: () => ['dashboard', 'cliente'] as const,
    talent: () => ['dashboard', 'talent'] as const,
    superAdmin: () => ['dashboard', 'super-admin'] as const,
  },

  // Talent
  tareas: {
    all: () => ['talent', 'tareas'] as const,
    list: () => [...queryKeys.tareas.all(), 'list'] as const,
    byId: (id: number) => [...queryKeys.tareas.all(), 'byId', id] as const,
    eliminadas: () => [...queryKeys.tareas.all(), 'eliminadas'] as const,
  },

  // Cliente
  clienteProyectos: {
    all: () => ['cliente', 'proyectos'] as const,
    list: () => [...queryKeys.clienteProyectos.all(), 'list'] as const,
  },

  clienteActividades: {
    all: () => ['cliente', 'actividades'] as const,
    list: () => [...queryKeys.clienteActividades.all(), 'list'] as const,
  },
};
