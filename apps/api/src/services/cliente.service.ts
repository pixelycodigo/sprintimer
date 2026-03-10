import { clienteRepository } from '../repositories/cliente.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { hashPassword } from '../utils/hash.js';
import { AppError } from '../middleware/error.middleware.js';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/Cliente.js';
import { eliminadoService } from './eliminado.service.js';

export class ClienteService {
  async findAll(): Promise<Cliente[]> {
    return clienteRepository.findAll();
  }

  async findAllActivos(): Promise<Cliente[]> {
    return clienteRepository.findAllActivos();
  }

  async findById(id: number): Promise<Cliente | null> {
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    return cliente;
  }

  async create(data: ClienteCreate): Promise<Cliente> {
    // Verificar si el email ya existe en clientes
    if (await clienteRepository.emailExists(data.email)) {
      throw new AppError('Ya existe un cliente registrado con este email', 400);
    }

    // Verificar si el email ya existe en usuarios
    if (await usuarioRepository.emailExists(data.email)) {
      throw new AppError('Ya existe un usuario registrado con este email', 400);
    }

    // Generar usuario a partir del email (parte antes del @)
    const usuario = data.email.split('@')[0];
    const usuarioDisponible = await this.generarUsuarioDisponible(usuario);

    // Hashear contraseña
    const passwordHash = await hashPassword(data.password);

    // Crear usuario con rol_id=3 (cliente)
    const userId = await usuarioRepository.create({
      nombre: data.nombre_cliente,
      usuario: usuarioDisponible,
      email: data.email,
      password_hash: passwordHash,
      rol_id: 3, // rol de cliente
      email_verificado: false,
      activo: true,
    });

    // Crear cliente (solo los campos que corresponden a la tabla clientes)
    const clienteData = {
      nombre_cliente: data.nombre_cliente,
      cargo: data.cargo || null,
      empresa: data.empresa,
      email: data.email,
      celular: data.celular || null,
      telefono: data.telefono || null,
      anexo: data.anexo || null,
      pais: data.pais || null,
      activo: data.activo !== undefined ? data.activo : true,
    };
    
    const id = await clienteRepository.create(clienteData as any);
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      throw new AppError('Error al crear el cliente', 500);
    }

    return cliente;
  }

  async generarUsuarioDisponible(baseUsuario: string): Promise<string> {
    let usuario = baseUsuario;
    let contador = 1;
    
    while (await usuarioRepository.usuarioExists(usuario)) {
      usuario = `${baseUsuario}${contador}`;
      contador++;
    }
    
    return usuario;
  }

  async update(id: number, data: ClienteUpdate): Promise<Cliente> {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Verificar email único si se está actualizando
    if (data.email && data.email !== cliente.email) {
      if (await clienteRepository.emailExists(data.email, id)) {
        throw new Error('Ya existe un cliente con ese email');
      }
    }

    const updated = await clienteRepository.update(id, data);

    if (!updated) {
      throw new Error('Error al actualizar el cliente');
    }

    return clienteRepository.findById(id) as Promise<Cliente>;
  }

  async delete(id: number): Promise<void> {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const deleted = await clienteRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el cliente');
    }
  }

  async softDelete(id: number, eliminadoPor?: number): Promise<void> {
    const cliente = await this.findById(id);

    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    const updated = await clienteRepository.softDelete(id);

    if (!updated) {
      throw new AppError('Error al eliminar el cliente', 500);
    }

    // Registrar en la tabla eliminados
    const fechaBorradoPermanente = new Date();
    fechaBorradoPermanente.setDate(fechaBorradoPermanente.getDate() + 30); // 30 días

    await eliminadoService.create({
      item_id: id,
      item_tipo: 'cliente',
      eliminado_por: eliminadoPor || 1,
      fecha_borrado_permanente: fechaBorradoPermanente,
      datos: {
        nombre_cliente: cliente.nombre_cliente,
        empresa: cliente.empresa,
        email: cliente.email,
        cargo: cliente.cargo,
      },
    });
  }

  async search(term: string): Promise<Cliente[]> {
    return clienteRepository.search(term);
  }
}

export const clienteService = new ClienteService();
