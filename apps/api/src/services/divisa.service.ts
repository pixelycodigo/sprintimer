import { divisaRepository } from '../repositories/divisa.repository.js';
import { Divisa, DivisaCreate, DivisaUpdate } from '../models/Divisa.js';
import { eliminadoService } from './eliminado.service.js';

export class DivisaService {
  async findAll(): Promise<Divisa[]> {
    return divisaRepository.findAll();
  }

  async findAllActivos(): Promise<Divisa[]> {
    return divisaRepository.findAllActivos();
  }

  async findById(id: number): Promise<Divisa> {
    const divisa = await divisaRepository.findById(id);

    if (!divisa) {
      throw new Error('Divisa no encontrada');
    }

    return divisa;
  }

  async create(data: DivisaCreate): Promise<Divisa> {
    // Verificar si el código ya existe
    if (await divisaRepository.codigoExists(data.codigo)) {
      throw new Error('Ya existe una divisa con ese código');
    }

    const id = await divisaRepository.create(data);
    const divisa = await divisaRepository.findById(id);

    if (!divisa) {
      throw new Error('Error al crear la divisa');
    }

    return divisa;
  }

  async update(id: number, data: DivisaUpdate): Promise<Divisa> {
    const divisa = await this.findById(id);

    if (!divisa) {
      throw new Error('Divisa no encontrada');
    }

    // Verificar código único si se está actualizando
    if (data.codigo && data.codigo !== divisa.codigo) {
      if (await divisaRepository.codigoExists(data.codigo, id)) {
        throw new Error('Ya existe una divisa con ese código');
      }
    }

    const updated = await divisaRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar la divisa');
    }

    return divisaRepository.findById(id) as Promise<Divisa>;
  }

  async delete(id: number): Promise<void> {
    const divisa = await this.findById(id);

    if (!divisa) {
      throw new Error('Divisa no encontrada');
    }

    const deleted = await divisaRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar la divisa');
    }
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const divisa = await this.findById(id);

    if (!divisa) {
      throw new Error('Divisa no encontrada');
    }

    const updated = await divisaRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar la divisa');
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30);

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'divisa',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        codigo: divisa.codigo,
        simbolo: divisa.simbolo,
        nombre: divisa.nombre,
      },
    });
  }
}

export const divisaService = new DivisaService();
