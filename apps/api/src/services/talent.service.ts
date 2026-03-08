import { talentRepository } from '../repositories/talent.repository.js';
import { TalentCreate, TalentUpdate, TalentWithDetails } from '../models/Talent.js';
import { hashPassword } from '../utils/hash.js';

export class TalentService {
  async findAll(): Promise<TalentWithDetails[]> {
    return talentRepository.findAll();
  }

  async findAllActivos(): Promise<TalentWithDetails[]> {
    return talentRepository.findAllActivos();
  }

  async findById(id: number): Promise<TalentWithDetails | null> {
    const talent = await talentRepository.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    return talent;
  }

  async create(data: TalentCreate): Promise<TalentWithDetails> {
    // Verificar si el email ya existe
    if (await talentRepository.emailExists(data.email)) {
      throw new Error('Ya existe un talent con ese email');
    }

    // Hashear password
    if (!data.password) {
      throw new Error('Password es requerido');
    }
    const passwordHash = await hashPassword(data.password);

    const id = await talentRepository.create({
      usuario_id: data.usuario_id,
      perfil_id: data.perfil_id,
      seniority_id: data.seniority_id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password_hash: passwordHash,
      costo_hora_fijo: data.costo_hora_fijo,
      costo_hora_variable_min: data.costo_hora_variable_min,
      costo_hora_variable_max: data.costo_hora_variable_max,
      activo: data.activo,
    });
    const talent = await talentRepository.findById(id);

    if (!talent) {
      throw new Error('Error al crear el talent');
    }

    return talent;
  }

  async update(id: number, data: TalentUpdate): Promise<TalentWithDetails> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    // Verificar email único si se está actualizando
    if (data.email && data.email !== talent.email) {
      if (await talentRepository.emailExists(data.email, id)) {
        throw new Error('Ya existe un talent con ese email');
      }
    }

    // Hashear password si se está actualizando
    let updateData: TalentUpdate = { ...data };
    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
      delete updateData.password;
    }

    const updated = await talentRepository.update(id, updateData);

    if (!updated) {
      throw new Error('Error al actualizar el talent');
    }

    return talentRepository.findById(id) as Promise<TalentWithDetails>;
  }

  async delete(id: number): Promise<void> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    const deleted = await talentRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el talent');
    }
  }

  async softDelete(id: number): Promise<void> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    const updated = await talentRepository.softDelete(id);

    if (!updated) {
      throw new Error('Error al eliminar el talent');
    }
  }

  async changePassword(id: number, password: string): Promise<void> {
    const talent = await this.findById(id);

    if (!talent) {
      throw new Error('Talent no encontrado');
    }

    const passwordHash = await hashPassword(password);
    const updated = await talentRepository.updatePassword(id, passwordHash);

    if (!updated) {
      throw new Error('Error al cambiar la contraseña');
    }
  }
}

export const talentService = new TalentService();
