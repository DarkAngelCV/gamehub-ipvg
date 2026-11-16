import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inscripcion } from './entities/inscripcion.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { InscripcionesService } from './inscripciones.service.js';
import { InscripcionesController } from './inscripciones.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscripcion, Equipo, Torneo]),
  ],
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
  exports: [InscripcionesService],
})
export class InscripcionesModule {}
