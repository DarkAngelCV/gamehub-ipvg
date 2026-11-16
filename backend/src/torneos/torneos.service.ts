import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Torneo } from './entities/torneo.entity.js';
import { CrearTorneoDto } from './dto/crear-torneo.dto.js';

@Injectable()
export class TorneosService {
  constructor(
    @InjectRepository(Torneo)
    private readonly torneosRepository: Repository<Torneo>,
  ) {}

  async crear(datos: CrearTorneoDto) {
    if (datos.fechaFin < datos.fechaInicio) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha de inicio',
      );
    }

    if (datos.fechaCierreInscripcion > datos.fechaInicio) {
      throw new BadRequestException(
        'El cierre de inscripción no puede ser posterior al inicio del torneo',
      );
    }

    const torneo = this.torneosRepository.create(datos);

    return this.torneosRepository.save(torneo);
  }

  async buscarTodos() {
    return this.torneosRepository.find({
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarPorId(id: number) {
    const torneo = await this.torneosRepository.findOne({
      where: { id },
    });

    if (!torneo) {
      throw new NotFoundException('Torneo no encontrado');
    }

    return torneo;
  }

  async actualizar(id: number, datos: Partial<CrearTorneoDto>) {
    const torneo = await this.buscarPorId(id);

    Object.assign(torneo, datos);

    if (torneo.fechaFin < torneo.fechaInicio) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha de inicio',
      );
    }

    if (torneo.fechaCierreInscripcion > torneo.fechaInicio) {
      throw new BadRequestException(
        'El cierre de inscripción no puede ser posterior al inicio del torneo',
      );
    }

    return this.torneosRepository.save(torneo);
  }

  async eliminar(id: number) {
    const torneo = await this.buscarPorId(id);

    await this.torneosRepository.remove(torneo);

    return { mensaje: 'Torneo eliminado correctamente' };
  }
}
