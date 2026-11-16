import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TorneosService } from './torneos.service.js';
import { CrearTorneoDto } from './dto/crear-torneo.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('torneos')
@ApiTags('Torneos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TorneosController {
  constructor(private readonly torneosService: TorneosService) {}

  @Post()
  @Roles('Admin')
  crear(@Body() datos: CrearTorneoDto) {
    return this.torneosService.crear(datos);
  }

  @Get()
  @Roles('Admin', 'Student')
  buscarTodos() {
    return this.torneosService.buscarTodos();
  }

  @Get(':id')
  @Roles('Admin', 'Student')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.buscarPorId(id);
  }

  @Put(':id')
  @Roles('Admin')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<CrearTorneoDto>,
  ) {
    return this.torneosService.actualizar(id, datos);
  }

  @Delete(':id')
  @Roles('Admin')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.torneosService.eliminar(id);
  }
}
