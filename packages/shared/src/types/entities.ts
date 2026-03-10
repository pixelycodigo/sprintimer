export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
  rol_id: number;
  rol: string;
  avatar?: string;
  email_verificado: boolean;
  activo: boolean;
  ultimo_login?: string;
  creado_por?: number;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: number;
  nombre_cliente: string;
  cargo?: string;
  empresa: string;
  email: string;
  celular?: string;
  telefono?: string;
  anexo?: string;
  pais?: string;
  activo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Talent {
  id: number;
  usuario_id?: number;
  perfil_id: number;
  seniority_id: number;
  nombre_completo: string;
  apellido: string;
  email: string;
  costo_hora_fijo?: number;
  costo_hora_variable_min?: number;
  costo_hora_variable_max?: number;
  activo?: boolean;
  perfil?: Perfil;
  seniority?: Seniority;
  created_at: string;
  updated_at: string;
}

export interface Perfil {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  created_at: string;
}

export interface Seniority {
  id: number;
  nombre: string;
  nivel_orden: number;
  activo?: boolean;
}

export interface Divisa {
  id: number;
  codigo: string;
  simbolo: string;
  nombre: string;
  activo?: boolean;
  created_at: string;
}

export interface CostoPorHora {
  id: number;
  tipo: 'fijo' | 'variable';
  costo_min?: number;
  costo_max?: number;
  costo_hora: number;
  divisa_id: number;
  perfil_id: number;
  seniority_id: number;
  concepto?: string;
  activo?: boolean;
  divisa?: Divisa;
  perfil?: Perfil;
  seniority?: Seniority;
  created_at: string;
  updated_at: string;
}

export interface Proyecto {
  id: number;
  cliente_id: number;
  nombre: string;
  descripcion?: string;
  modalidad: 'sprint' | 'ad-hoc';
  formato_horas: 'minutos' | 'cuartiles' | 'sin_horas';
  moneda_id?: number;
  activo?: boolean;
  cliente?: Cliente;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: number;
  proyecto_id: number;
  nombre: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo: boolean;
}

export interface Actividad {
  id: number;
  proyecto_id: number;
  sprint_id?: number;
  nombre: string;
  descripcion?: string;
  horas_estimadas: number;
  activo?: boolean;
  proyecto?: Proyecto;
  sprint?: Sprint;
  talentes_asignados?: number;
  created_at: string;
  updated_at: string;
}

export interface Asignacion {
  id: number;
  actividad_id: number;
  talent_id: number;
  fecha_asignacion: string;
  activo: boolean;
  actividad?: Actividad;
  talent?: Talent;
}

export interface Tarea {
  id: number;
  actividad_id: number;
  talent_id: number;
  nombre: string;
  descripcion?: string;
  horas_registradas: number;
  completado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Eliminado {
  id: number;
  item_id: number;
  item_tipo: string;
  eliminado_por: number;
  fecha_eliminacion: string;
  fecha_borrado_permanente: string;
  datos: Record<string, unknown>;
  dias_restantes: number;
}

// Tipos para creación y actualización
export interface CreateClienteInput {
  nombre_cliente: string;
  cargo?: string | null;
  empresa: string;
  email: string;
  password: string;
  password_confirm?: string;
  celular?: string | null;
  telefono?: string | null;
  anexo?: string | null;
  pais?: string | null;
  activo?: boolean;
}
export interface UpdateClienteInput extends Partial<CreateClienteInput> {}

export interface CreateTalentInput extends Omit<Talent, 'id' | 'created_at' | 'updated_at' | 'perfil' | 'seniority'> {
  activo?: boolean;
  perfil_nombre?: string;
  seniority_nombre?: string;
  password?: string;
  password_confirm?: string;
}
export interface UpdateTalentInput extends Partial<CreateTalentInput> {}

export interface CreatePerfilInput extends Omit<Perfil, 'id' | 'created_at'> {
  activo?: boolean;
}
export interface UpdatePerfilInput extends Partial<CreatePerfilInput> {}

export interface CreateSeniorityInput extends Omit<Seniority, 'id'> {
  activo?: boolean;
}
export interface UpdateSeniorityInput extends Partial<CreateSeniorityInput> {}

export interface CreateDivisaInput extends Omit<Divisa, 'id' | 'created_at'> {
  activo?: boolean;
}
export interface UpdateDivisaInput extends Partial<CreateDivisaInput> {}

export interface CreateProyectoInput extends Omit<Proyecto, 'id' | 'created_at' | 'updated_at' | 'cliente'> {
  activo?: boolean;
  cliente_nombre?: string;
}
export interface UpdateProyectoInput extends Partial<CreateProyectoInput> {}

export interface CreateActividadInput extends Omit<Actividad, 'id' | 'created_at' | 'updated_at' | 'proyecto' | 'sprint' | 'talentes_asignados'> {
  activo?: boolean;
  proyecto_nombre?: string;
}
export interface UpdateActividadInput extends Partial<CreateActividadInput> {}

export interface CreateAsignacionInput {
  actividad_id: number;
  talent_id: number;
  fecha_asignacion?: string;
  activo?: boolean;
  actividad_nombre?: string;
  talent_nombre?: string;
  talent_email?: string;
  perfil_nombre?: string;
}
export interface UpdateAsignacionInput extends Partial<CreateAsignacionInput> {}

export interface CreateCostoPorHoraInput extends Omit<CostoPorHora, 'id' | 'created_at' | 'updated_at' | 'divisa' | 'perfil' | 'seniority'> {
  activo?: boolean;
  divisa_codigo?: string;
  perfil_nombre?: string;
  seniority_nombre?: string;
}
export interface UpdateCostoPorHoraInput extends Partial<CreateCostoPorHoraInput> {}

export interface CreateUsuarioInput extends Omit<Usuario, 'id' | 'rol' | 'avatar' | 'email_verificado' | 'activo' | 'ultimo_login' | 'creado_por' | 'created_at' | 'updated_at'> {
  password: string;
  rol_id: number;
  activo?: boolean;
}
export interface UpdateUsuarioInput extends Partial<Pick<Usuario, 'nombre' | 'email' | 'activo'>> {
  password?: string;
  password_confirm?: string;
}

export interface CreateEliminadoInput extends Omit<Eliminado, 'id' | 'fecha_eliminacion' | 'fecha_borrado_permanente' | 'datos' | 'dias_restantes'> {}
export interface UpdateEliminadoInput extends Partial<CreateEliminadoInput> {}

// Tipos extendidos para la UI (con campos calculados)
export interface ActividadWithRelations extends Actividad {
  proyecto_nombre?: string;
}

export interface AsignacionWithRelations extends Asignacion {
  actividad_nombre?: string;
  talent_nombre?: string;
  talent_email?: string;
  perfil_nombre?: string;
  seniority_nombre?: string;
  proyecto_nombre?: string;
}

export interface TalentWithRelations extends Talent {
  perfil_nombre?: string;
  seniority_nombre?: string;
}

export interface CostoPorHoraWithRelations extends CostoPorHora {
  divisa_codigo?: string;
  divisa_simbolo?: string;
  perfil_nombre?: string;
  seniority_nombre?: string;
}

export interface ProyectoWithRelations extends Proyecto {
  cliente_nombre?: string;
}
