import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Equipo } from './entities/equipo.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { EquiposService } from './equipos.service.js';
import { EquiposController } from './equipos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo, Usuario])],
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [EquiposService],
})
export class EquiposModule {}