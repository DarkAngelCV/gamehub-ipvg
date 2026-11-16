import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InscripcionesService } from './inscripciones.service.js';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('inscripciones')
@ApiTags('Inscripciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InscripcionesController {
  constructor(
    private readonly inscripcionesService: InscripcionesService,
  ) {}

  @Post()
  @Roles('Admin')
  crear(@Body() datos: CrearInscripcionDto) {
    return this.inscripcionesService.crear(datos);
  }

  @Get()
  @Roles('Admin', 'Student')
  buscarTodos() {
    return this.inscripcionesService.buscarTodos();
  }

  @Get(':id')
  @Roles('Admin', 'Student')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.buscarPorId(id);
  }

  @Put(':id/estado')
  @Roles('Admin')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: 'Pendiente' | 'Aprobada' | 'Rechazada',
  ) {
    return this.inscripcionesService.actualizarEstado(id, estado);
  }

  @Delete(':id')
  @Roles('Admin')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.eliminar(id);
  }
}
