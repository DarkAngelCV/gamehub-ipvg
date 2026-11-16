import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Torneo } from '../torneos/entities/torneo.entity.js';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity.js';
import { Resultado } from '../resultados/entities/resultado.entity.js';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Torneo)
    private readonly torneoRepository: Repository<Torneo>,

    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,

    @InjectRepository(Resultado)
    private readonly resultadoRepository: Repository<Resultado>,
  ) {}

  async buscarPorTorneo(torneoId: number) {
    const torneo = await this.torneoRepository.findOne({
      where: { id: torneoId },
    });

    if (!torneo) {
      throw new NotFoundException(
        `No se encontró el torneo con ID ${torneoId}`,
      );
    }

    const inscripciones = await this.inscripcionRepository.find({
      where: {
        torneo: { id: torneoId },
        estado: 'Aprobada',
      },
      relations: {
        equipo: true,
      },
    });

    const resultados = await this.resultadoRepository.find({
      relations: {
        partido: {
          torneo: true,
          equipoLocal: true,
          equipoVisitante: true,
        },
      },
    });

    const tabla = inscripciones.map((inscripcion) => ({
      equipoId: inscripcion.equipo.id,
      equipo: inscripcion.equipo.nombre,
      sigla: inscripcion.equipo.sigla,
      partidosJugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      puntosFavor: 0,
      puntosContra: 0,
      diferencia: 0,
      puntos: 0,
    }));

    for (const resultado of resultados) {
      const partido = resultado.partido;

      if (
        !partido ||
        partido.torneo.id !== torneoId ||
        partido.estado !== 'Finalizado'
      ) {
        continue;
      }

      const local = tabla.find(
        (equipo) => equipo.equipoId === partido.equipoLocal.id,
      );

      const visitante = tabla.find(
        (equipo) => equipo.equipoId === partido.equipoVisitante.id,
      );

      if (!local || !visitante) {
        continue;
      }

      const puntosLocal = Number(resultado.puntosLocal);
      const puntosVisitante = Number(resultado.puntosVisitante);

      local.partidosJugados++;
      visitante.partidosJugados++;

      local.puntosFavor += puntosLocal;
      local.puntosContra += puntosVisitante;

      visitante.puntosFavor += puntosVisitante;
      visitante.puntosContra += puntosLocal;

      if (puntosLocal > puntosVisitante) {
        local.ganados++;
        visitante.perdidos++;
        local.puntos += 3;
      } else if (puntosLocal < puntosVisitante) {
        visitante.ganados++;
        local.perdidos++;
        visitante.puntos += 3;
      } else {
        local.empatados++;
        visitante.empatados++;
        local.puntos++;
        visitante.puntos++;
      }
    }

    tabla.forEach((equipo) => {
      equipo.diferencia = equipo.puntosFavor - equipo.puntosContra;
    });

    tabla.sort(
      (a, b) =>
        b.puntos - a.puntos ||
        b.diferencia - a.diferencia ||
        b.puntosFavor - a.puntosFavor,
    );

    return {
      torneo: {
        id: torneo.id,
        nombre: torneo.nombre,
      },
      ranking: tabla.map((equipo, indice) => ({
        posicion: indice + 1,
        ...equipo,
      })),
    };
  }
}
