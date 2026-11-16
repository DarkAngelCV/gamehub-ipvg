import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Torneo } from './entities/torneo.entity.js';
import { TorneosService } from './torneos.service.js';
import { TorneosController } from './torneos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Torneo])],
  controllers: [TorneosController],
  providers: [TorneosService],
  exports: [TorneosService],
})
export class TorneosModule {}
