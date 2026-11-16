import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resultado } from './entities/resultado.entity.js';
import { Partido } from '../partidos/entities/partido.entity.js';
import { CrearResultadoDto } from './dto/crear-resultado.dto.js';

@Injectable()
export class ResultadosService {
  constructor(
    @InjectRepository(Resultado)
    private readonly resultadosRepository: Repository<Resultado>,

    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,
  ) {}

  private calcularGanador(
    puntosLocal: number,
    puntosVisitante: number,
    partido: Partido,
  ) {
    if (puntosLocal > puntosVisitante) {
      return partido.equipoLocal.nombre;
    }

    if (puntosVisitante > puntosLocal) {
      return partido.equipoVisitante.nombre;
    }

    return 'Empate';
  }

  async crear(datos: CrearResultadoDto) {
    const partido = await this.partidosRepository.findOne({
      where: { id: datos.partidoId },
      relations: {
        equipoLocal: true,
        equipoVisitante: true,
      },
    });

    if (!partido) {
      throw new NotFoundException('El partido no existe');
    }

    if (partido.estado === 'Pendiente') {
      throw new BadRequestException(
        'No se puede registrar el resultado de un partido pendiente',
      );
    }

    const existente = await this.resultadosRepository.findOne({
      where: { partido: { id: partido.id } },
    });

    if (existente) {
      throw new ConflictException(
        'El partido ya tiene un resultado registrado',
      );
    }

    const ganador = this.calcularGanador(
      datos.puntosLocal,
      datos.puntosVisitante,
      partido,
    );

    const resultado = this.resultadosRepository.create({
      partido,
      puntosLocal: datos.puntosLocal,
      puntosVisitante: datos.puntosVisitante,
      ganador,
      observaciones: datos.observaciones,
    });

    partido.estado = 'Finalizado';
    await this.partidosRepository.save(partido);

    return this.resultadosRepository.save(resultado);
  }

  async buscarTodos() {
    return this.resultadosRepository.find({
      relations: {
        partido: {
          torneo: true,
          equipoLocal: true,
          equipoVisitante: true,
        },
      },
      order: { id: 'DESC' },
    });
  }

  async buscarPorId(id: number) {
    const resultado = await this.resultadosRepository.findOne({
      where: { id },
      relations: {
        partido: {
          torneo: true,
          equipoLocal: true,
          equipoVisitante: true,
        },
      },
    });

    if (!resultado) {
      throw new NotFoundException('Resultado no encontrado');
    }

    return resultado;
  }

  async eliminar(id: number) {
    const resultado = await this.buscarPorId(id);
    await this.resultadosRepository.remove(resultado);

    return { mensaje: 'Resultado eliminado correctamente' };
  }
}
