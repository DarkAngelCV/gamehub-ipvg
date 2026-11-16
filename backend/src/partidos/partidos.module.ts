import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Partido } from './entities/partido.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity.js';

import { PartidosService } from './partidos.service.js';
import { PartidosController } from './partidos.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partido,
      Torneo,
      Equipo,
      Inscripcion,
    ]),
  ],
  controllers: [PartidosController],
  providers: [PartidosService],
  exports: [PartidosService],
})
export class PartidosModule {}