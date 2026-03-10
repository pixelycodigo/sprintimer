import { proyectoRepository } from '../repositories/proyecto.repository.js';
import { Proyecto, ProyectoCreate, ProyectoUpdate } from '../models/Proyecto.js';
import { eliminadoService } from './eliminado.service.js';

export class ProyectoService {
  async findAll(): Promise<Proyecto[]> {
    return proyectoRepository.findAll();
  }

  async findAllActivos(): Promise<Proyecto[]> {
    return proyectoRepository.findAllActivos();
  }

  async findById(id: number): Promise<Proyecto | null> {
    const proyecto = await proyectoRepository.findById(id);

    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }

    return proyecto;
  }

  async findByClienteId(clienteId: number): Promise<Proyecto[]> {
    return proyectoRepository.findByClienteId(clienteId);
  }

  async create(data: ProyectoCreate): Promise<Proyecto> {
    const id = await proyectoRepository.create(data);
    const proyecto = await proyectoRepository.findById(id);

    if (!proyecto) {
      throw new Error('Error al crear el proyecto');
    }

    return proyecto;
  }

  async update(id: number, data: ProyectoUpdate): Promise<Proyecto> {
    const proyecto = await this.findById(id);

    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }

    const updated = await proyectoRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar el proyecto');
    }

    return proyectoRepository.findById(id) as Promise<Proyecto>;
  }

  async delete(id: number): Promise<void> {
    const proyecto = await this.findById(id);

    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }

    const deleted = await proyectoRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el proyecto');
    }
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const proyecto = await this.findById(id);

    if (!proyecto) {
      throw new Error('Proyecto no encontrado');
    }

    const updated = await proyectoRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el proyecto');
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'proyecto',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        modalidad: proyecto.modalidad,
      },
    });
  }

  async search(term: string): Promise<Proyecto[]> {
    return proyectoRepository.search(term);
  }
}

export const proyectoService = new ProyectoService();
