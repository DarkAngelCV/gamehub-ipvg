import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resultado } from './entities/resultado.entity.js';
import { Partido } from '../partidos/entities/partido.entity.js';

import { ResultadosService } from './resultados.service.js';
import { ResultadosController } from './resultados.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Resultado, Partido])],
  controllers: [ResultadosController],
  providers: [ResultadosService],
  exports: [ResultadosService],
})
export class ResultadosModule {}