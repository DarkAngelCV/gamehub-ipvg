import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { Inscripcion } from './entities/inscripcion.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto.js';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionesRepository: Repository<Inscripcion>,

    @InjectRepository(Equipo)
    private readonly equiposRepository: Repository<Equipo>,

    @InjectRepository(Torneo)
    private readonly torneosRepository: Repository<Torneo>,
  ) {}

  async crear(datos: CrearInscripcionDto) {
    const equipo = await this.equiposRepository.findOneBy({
      id: datos.equipoId,
    });

    if (!equipo) {
      throw new NotFoundException('El equipo no existe');
    }

    const torneo = await this.torneosRepository.findOneBy({
      id: datos.torneoId,
    });

    if (!torneo) {
      throw new NotFoundException('El torneo no existe');
    }

    if (torneo.estado !== 'Pendiente') {
      throw new BadRequestException(
        'No se puede inscribir en un torneo que ya comenzó o finalizó',
      );
    }

    const hoy = new Date().toISOString().slice(0, 10);

    if (hoy > torneo.fechaCierreInscripcion) {
      throw new BadRequestException(
        'El período de inscripción ha finalizado',
      );
    }

    const existente = await this.inscripcionesRepository.findOne({
      where: {
        equipo: { id: equipo.id },
        torneo: { id: torneo.id },
      },
    });

    if (existente) {
      throw new ConflictException(
        'El equipo ya está inscrito en este torneo',
      );
    }

    // Los estados Pendiente y Aprobada ocupan un cupo.
    const cantidad = await this.inscripcionesRepository.count({
      where: {
        torneo: { id: torneo.id },
        estado: In(['Pendiente', 'Aprobada']),
      },
    });

    if (cantidad >= torneo.capacidadMaxima) {
      throw new BadRequestException(
        'El torneo alcanzó su capacidad máxima',
      );
    }

    const inscripcion = this.inscripcionesRepository.create({
      equipo,
      torneo,
    });

    return this.inscripcionesRepository.save(inscripcion);
  }

  async buscarTodos() {
    return this.inscripcionesRepository.find({
      relations: {
        equipo: true,
        torneo: true,
      },
      order: {
        fechaInscripcion: 'DESC',
      },
    });
  }

  async buscarPorId(id: number) {
    const inscripcion = await this.inscripcionesRepository.findOne({
      where: { id },
      relations: {
        equipo: true,
        torneo: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    return inscripcion;
  }

  async actualizarEstado(
    id: number,
    estado: 'Pendiente' | 'Aprobada' | 'Rechazada',
  ) {
    const inscripcion = await this.buscarPorId(id);

    if (estado === 'Aprobada' && inscripcion.estado !== 'Aprobada') {
      // Excluimos la inscripción actual para no contarla dos veces.
      const cantidad = await this.inscripcionesRepository.count({
        where: {
          torneo: { id: inscripcion.torneo.id },
          estado: In(['Pendiente', 'Aprobada']),
          id: Not(inscripcion.id),
        },
      });

      if (cantidad >= inscripcion.torneo.capacidadMaxima) {
        throw new BadRequestException(
          'El torneo alcanzó su capacidad máxima',
        );
      }
    }

    inscripcion.estado = estado;

    return this.inscripcionesRepository.save(inscripcion);
  }

  async eliminar(id: number) {
    const inscripcion = await this.buscarPorId(id);

    await this.inscripcionesRepository.remove(inscripcion);

    return { mensaje: 'Inscripción eliminada correctamente' };
  }
}
