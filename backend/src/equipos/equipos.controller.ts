import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EquiposService } from './equipos.service.js';
import { CrearEquipoDto } from './dto/crear-equipo.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('equipos')
@ApiTags('Equipos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post()
  @Roles('Admin')
  crear(@Body() datos: CrearEquipoDto) {
    return this.equiposService.crear(datos);
  }

  @Get()
  @Roles('Admin', 'Student')
  buscarTodos() {
    return this.equiposService.buscarTodos();
  }

  @Get(':id')
  @Roles('Admin', 'Student')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.buscarPorId(id);
  }

  @Put(':id')
  @Roles('Admin')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<CrearEquipoDto>,
  ) {
    return this.equiposService.actualizar(id, datos);
  }

  @Delete(':id')
  @Roles('Admin')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.equiposService.eliminar(id);
  }
}
