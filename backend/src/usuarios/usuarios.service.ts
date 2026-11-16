import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

import { Usuario } from './entities/usuario.entity.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async crear(datos: CrearUsuarioDto) {
    const existente = await this.usuariosRepository.findOneBy({
      email: datos.email,
    });

    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(datos.password, 10);

    const usuario = this.usuariosRepository.create({
      nombre: datos.nombre,
      email: datos.email,
      password: passwordHash,
      rol: 'Student',
    });

    const guardado = await this.usuariosRepository.save(usuario);

    const { password, ...resultado } = guardado;
    return resultado;
  }

  async buscarTodos() {
    return this.usuariosRepository.find({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        fechaRegistro: true,
      },
    });
  }

  async buscarPorId(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        fechaRegistro: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }
}
