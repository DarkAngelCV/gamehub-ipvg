import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResultadosService } from './resultados.service.js';
import { CrearResultadoDto } from './dto/crear-resultado.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('resultados')
@ApiTags('Resultados')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultadosController {
  constructor(
    private readonly resultadosService: ResultadosService,
  ) {}

  @Post()
  @Roles('Admin')
  crear(@Body() datos: CrearResultadoDto) {
    return this.resultadosService.crear(datos);
  }

  @Get()
  @Roles('Admin', 'Student')
  buscarTodos() {
    return this.resultadosService.buscarTodos();
  }

  @Get(':id')
  @Roles('Admin', 'Student')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.resultadosService.buscarPorId(id);
  }

  @Delete(':id')
  @Roles('Admin')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.resultadosService.eliminar(id);
  }
}
