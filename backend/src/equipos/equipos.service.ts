import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Equipo } from './entities/equipo.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { CrearEquipoDto } from './dto/crear-equipo.dto.js';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equiposRepository: Repository<Equipo>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  private formatearEquipo(equipo: Equipo) {
    const { password, ...capitanSeguro } = equipo.capitan;

    return {
      ...equipo,
      capitan: capitanSeguro,
    };
  }

  async crear(datos: CrearEquipoDto) {
    const existente = await this.equiposRepository.findOneBy({
      sigla: datos.sigla,
    });

    if (existente) {
      throw new ConflictException('La sigla ya está registrada');
    }

    const capitan = await this.usuariosRepository.findOneBy({
      id: datos.capitanId,
    });

    if (!capitan) {
      throw new NotFoundException('El capitán no existe');
    }

    const equipo = this.equiposRepository.create({
      nombre: datos.nombre,
      sigla: datos.sigla,
      descripcion: datos.descripcion,
      capitan,
    });

    const guardado = await this.equiposRepository.save(equipo);

    return this.formatearEquipo(guardado);
  }

  async buscarTodos() {
    const equipos = await this.equiposRepository.find({
      relations: { capitan: true },
    });

    return equipos.map((equipo) => this.formatearEquipo(equipo));
  }

  // Buscar un equipo por su ID.
  async buscarPorId(id: number) {
    const equipo = await this.equiposRepository.findOne({
      where: { id },
      relations: { capitan: true },
    });

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    return this.formatearEquipo(equipo);
  }

  async actualizar(id: number, datos: Partial<CrearEquipoDto>) {
    const equipo = await this.buscarPorId(id);

    if (datos.capitanId !== undefined) {
      const capitan = await this.usuariosRepository.findOneBy({
        id: datos.capitanId,
      });

      if (!capitan) {
        throw new NotFoundException('El capitán no existe');
      }

      equipo.capitan = capitan;
    }

    if (datos.sigla && datos.sigla !== equipo.sigla) {
      const existente = await this.equiposRepository.findOneBy({
        sigla: datos.sigla,
      });

      if (existente) {
        throw new ConflictException('La sigla ya está registrada');
      }
    }

    Object.assign(equipo, {
      nombre: datos.nombre ?? equipo.nombre,
      sigla: datos.sigla ?? equipo.sigla,
      descripcion: datos.descripcion ?? equipo.descripcion,
    });

    const actualizado = await this.equiposRepository.save(equipo);

    return this.formatearEquipo(actualizado);
  }

  async eliminar(id: number) {
    const equipo = await this.equiposRepository.findOne({
      where: { id },
    });

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    await this.equiposRepository.remove(equipo);

    return { mensaje: 'Equipo eliminado correctamente' };
  }
}
