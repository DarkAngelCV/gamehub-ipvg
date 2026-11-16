import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RankingService } from './ranking.service.js';
import { RankingController } from './ranking.controller.js';

import { Torneo } from '../torneos/entities/torneo.entity.js';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity.js';
import { Resultado } from '../resultados/entities/resultado.entity.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Torneo, Inscripcion, Resultado]),
    AuthModule,
  ],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
