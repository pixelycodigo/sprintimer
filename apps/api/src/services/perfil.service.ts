import { perfilRepository } from '../repositories/perfil.repository.js';
import { Perfil, PerfilCreate, PerfilUpdate } from '../models/Perfil.js';
import { eliminadoService } from './eliminado.service.js';

export class PerfilService {
  async findAll(): Promise<Perfil[]> {
    return perfilRepository.findAll();
  }

  async findAllActivos(): Promise<Perfil[]> {
    return perfilRepository.findAllActivos();
  }

  async findById(id: number): Promise<Perfil | null> {
    const perfil = await perfilRepository.findById(id);

    if (!perfil) {
      throw new Error('Perfil no encontrado');
    }

    return perfil;
  }

  async create(data: PerfilCreate): Promise<Perfil> {
    // Verificar si el nombre ya existe
    if (await perfilRepository.nombreExists(data.nombre)) {
      throw new Error('Ya existe un perfil con ese nombre');
    }

    const id = await perfilRepository.create(data);
    const perfil = await perfilRepository.findById(id);

    if (!perfil) {
      throw new Error('Error al crear el perfil');
    }

    return perfil;
  }

  async update(id: number, data: PerfilUpdate): Promise<Perfil> {
    const perfil = await this.findById(id);

    if (!perfil) {
      throw new Error('Perfil no encontrado');
    }

    // Verificar nombre único si se está actualizando
    if (data.nombre && data.nombre !== perfil.nombre) {
      if (await perfilRepository.nombreExists(data.nombre, id)) {
        throw new Error('Ya existe un perfil con ese nombre');
      }
    }

    const updated = await perfilRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar el perfil');
    }

    return perfilRepository.findById(id) as Promise<Perfil>;
  }

  async delete(id: number): Promise<void> {
    const perfil = await this.findById(id);

    if (!perfil) {
      throw new Error('Perfil no encontrado');
    }

    const deleted = await perfilRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el perfil');
    }
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const perfil = await this.findById(id);

    if (!perfil) {
      throw new Error('Perfil no encontrado');
    }

    const updated = await perfilRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el perfil');
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'perfil',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        nombre: perfil.nombre,
        descripcion: perfil.descripcion,
      },
    });
  }
}

export const perfilService = new PerfilService();
