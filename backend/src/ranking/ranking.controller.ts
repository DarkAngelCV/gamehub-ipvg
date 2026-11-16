import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { RankingService } from './ranking.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('ranking')
@ApiTags('Ranking')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get(':torneoId')
  @Roles('Admin', 'Student')
  buscarPorTorneo(
    @Param('torneoId', ParseIntPipe) torneoId: number,
  ) {
    return this.rankingService.buscarPorTorneo(torneoId);
  }
}
