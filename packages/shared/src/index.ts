export * from './types/roles';
export * from './types/entities';

// Utilidades compartidas
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ApiResponse<T> = {
  data: T;
  message?: string;
  error?: string;
};
