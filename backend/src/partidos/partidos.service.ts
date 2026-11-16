import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Partido } from './entities/partido.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity.js';
import { CrearPartidoDto } from './dto/crear-partido.dto.js';

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,

    @InjectRepository(Torneo)
    private readonly torneosRepository: Repository<Torneo>,

    @InjectRepository(Equipo)
    private readonly equiposRepository: Repository<Equipo>,

    @InjectRepository(Inscripcion)
    private readonly inscripcionesRepository: Repository<Inscripcion>,
  ) {}

  async crear(datos: CrearPartidoDto) {
    if (datos.equipoLocalId === datos.equipoVisitanteId) {
      throw new BadRequestException(
        'Un equipo no puede enfrentarse a sí mismo',
      );
    }

    const torneo = await this.torneosRepository.findOneBy({
      id: datos.torneoId,
    });

    if (!torneo) {
      throw new NotFoundException('El torneo no existe');
    }

    const equipoLocal = await this.equiposRepository.findOneBy({
      id: datos.equipoLocalId,
    });

    if (!equipoLocal) {
      throw new NotFoundException('El equipo local no existe');
    }

    const equipoVisitante = await this.equiposRepository.findOneBy({
      id: datos.equipoVisitanteId,
    });

    if (!equipoVisitante) {
      throw new NotFoundException('El equipo visitante no existe');
    }

    const inscripciones = await this.inscripcionesRepository.count({
      where: [
        {
          torneo: { id: torneo.id },
          equipo: { id: equipoLocal.id },
          estado: 'Aprobada',
        },
        {
          torneo: { id: torneo.id },
          equipo: { id: equipoVisitante.id },
          estado: 'Aprobada',
        },
      ],
    });

    if (inscripciones !== 2) {
      throw new BadRequestException(
        'Ambos equipos deben tener una inscripción aprobada en el torneo',
      );
    }

    const partido = this.partidosRepository.create({
      torneo,
      equipoLocal,
      equipoVisitante,
      fechaPartido: new Date(datos.fechaPartido),
    });

    return this.partidosRepository.save(partido);
  }

  async buscarTodos() {
    return this.partidosRepository.find({
      relations: {
        torneo: true,
        equipoLocal: true,
        equipoVisitante: true,
      },
      order: {
        fechaPartido: 'ASC',
      },
    });
  }

  async buscarPorId(id: number) {
    const partido = await this.partidosRepository.findOne({
      where: { id },
      relations: {
        torneo: true,
        equipoLocal: true,
        equipoVisitante: true,
      },
    });

    if (!partido) {
      throw new NotFoundException('Partido no encontrado');
    }

    return partido;
  }

  async actualizar(
    id: number,
    datos: Partial<CrearPartidoDto>,
  ) {
    const partido = await this.buscarPorId(id);

    if (datos.fechaPartido) {
      partido.fechaPartido = new Date(datos.fechaPartido);
    }

    return this.partidosRepository.save(partido);
  }

  async actualizarEstado(
    id: number,
    estado: 'Pendiente' | 'En curso' | 'Finalizado',
  ) {
    const partido = await this.buscarPorId(id);
    partido.estado = estado;

    return this.partidosRepository.save(partido);
  }

  async eliminar(id: number) {
    const partido = await this.buscarPorId(id);
    await this.partidosRepository.remove(partido);

    return { mensaje: 'Partido eliminado correctamente' };
  }
}
