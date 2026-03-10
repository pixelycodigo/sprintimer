import { eliminadoRepository } from '../repositories/eliminado.repository.js';
import { Eliminado, EliminadoCreate } from '../models/Eliminado.js';

export class EliminadoService {
  async findAll(): Promise<Eliminado[]> {
    const eliminados = await eliminadoRepository.findAll();
    
    // Calcular días restantes para cada eliminado
    return eliminados.map(eliminado => ({
      ...eliminado,
      dias_restantes: this.calcularDiasRestantes(eliminado.fecha_borrado_permanente),
    }));
  }

  async findById(id: number): Promise<Eliminado | null> {
    const eliminado = await eliminadoRepository.findById(id);

    if (!eliminado) {
      throw new Error('Elemento eliminado no encontrado');
    }

    return {
      ...eliminado,
      dias_restantes: this.calcularDiasRestantes(eliminado.fecha_borrado_permanente),
    };
  }

  async findByTipo(itemTipo: string): Promise<Eliminado[]> {
    const eliminados = await eliminadoRepository.findByTipo(itemTipo);
    
    // Calcular días restantes para cada eliminado
    return eliminados.map(eliminado => ({
      ...eliminado,
      dias_restantes: this.calcularDiasRestantes(eliminado.fecha_borrado_permanente),
    }));
  }

  private calcularDiasRestantes(fechaBorrado: Date | string): number {
    const hoy = new Date();
    const fechaBorradoPermanente = new Date(fechaBorrado);
    const diferenciaTiempo = fechaBorradoPermanente.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    return Math.max(0, diasRestantes);
  }

  async create(data: EliminadoCreate): Promise<Eliminado> {
    const id = await eliminadoRepository.create(data);
    const eliminado = await eliminadoRepository.findById(id);

    if (!eliminado) {
      throw new Error('Error al registrar el elemento eliminado');
    }

    return {
      ...eliminado,
      dias_restantes: this.calcularDiasRestantes(eliminado.fecha_borrado_permanente),
    };
  }

  async delete(id: number): Promise<void> {
    const eliminado = await this.findById(id);

    if (!eliminado) {
      throw new Error('Elemento eliminado no encontrado');
    }

    const deleted = await eliminadoRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar permanentemente');
    }
  }

  async restore(id: number): Promise<Eliminado | null> {
    const eliminado = await this.findById(id);
    await eliminadoRepository.restore(id);
    return eliminado;
  }

  async deleteExpired(): Promise<number> {
    return eliminadoRepository.deleteExpired();
  }
}

export const eliminadoService = new EliminadoService();
