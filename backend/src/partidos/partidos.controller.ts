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
import { PartidosService } from './partidos.service.js';
import { CrearPartidoDto } from './dto/crear-partido.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('partidos')
@ApiTags('Partidos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Post()
  @Roles('Admin')
  crear(@Body() datos: CrearPartidoDto) {
    return this.partidosService.crear(datos);
  }

  @Get()
  @Roles('Admin', 'Student')
  buscarTodos() {
    return this.partidosService.buscarTodos();
  }

  @Get(':id')
  @Roles('Admin', 'Student')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.buscarPorId(id);
  }

  @Put(':id')
  @Roles('Admin')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<CrearPartidoDto>,
  ) {
    return this.partidosService.actualizar(id, datos);
  }

  @Put(':id/estado')
  @Roles('Admin')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: 'Pendiente' | 'En curso' | 'Finalizado',
  ) {
    return this.partidosService.actualizarEstado(id, estado);
  }

  @Delete(':id')
  @Roles('Admin')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.partidosService.eliminar(id);
  }
}
