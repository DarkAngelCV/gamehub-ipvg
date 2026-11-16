import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { ResultadosService } from './resultados.service.js';

import { Resultado } from './entities/resultado.entity.js';
import { Partido } from '../partidos/entities/partido.entity.js';

describe('ResultadosService', () => {
  let service: ResultadosService;

  let resultadosRepository: Record<string, ReturnType<typeof vi.fn>>;
  let partidosRepository: Record<string, ReturnType<typeof vi.fn>>;

  const partido = {
    id: 1,
    estado: 'En curso',
    equipoLocal: { id: 1, nombre: 'Los Campeones' },
    equipoVisitante: { id: 2, nombre: 'Los Guerreros' },
  };

  const datos = {
    partidoId: 1,
    puntosLocal: 3,
    puntosVisitante: 1,
    observaciones: 'Partido de prueba',
  };

  beforeEach(() => {
    partidosRepository = {
      findOne: vi.fn().mockResolvedValue({ ...partido }),
      save: vi.fn().mockImplementation((datos) => datos),
    };

    resultadosRepository = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((datos) => datos),
      save: vi.fn().mockImplementation((datos) => ({
        id: 1,
        ...datos,
      })),
      find: vi.fn(),
      remove: vi.fn(),
    };

    service = new ResultadosService(
      resultadosRepository as unknown as Repository<Resultado>,
      partidosRepository as unknown as Repository<Partido>,
    );
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería registrar un resultado correctamente', async () => {
    const respuesta = await service.crear(datos);

    expect(respuesta.puntosLocal).toBe(3);
    expect(respuesta.puntosVisitante).toBe(1);
    expect(respuesta.ganador).toBe('Los Campeones');
    expect(partidosRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'Finalizado' }),
    );
    expect(resultadosRepository.save).toHaveBeenCalled();
  });

  it('debería calcular correctamente el equipo visitante ganador', async () => {
    const respuesta = await service.crear({
      ...datos,
      puntosLocal: 1,
      puntosVisitante: 3,
    });

    expect(respuesta.ganador).toBe('Los Guerreros');
  });

  it('debería registrar correctamente un empate', async () => {
    const respuesta = await service.crear({
      ...datos,
      puntosLocal: 2,
      puntosVisitante: 2,
    });

    expect(respuesta.ganador).toBe('Empate');
  });

  it('debería rechazar un partido inexistente', async () => {
    partidosRepository.findOne.mockResolvedValue(null);

    await expect(service.crear(datos)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería impedir registrar resultados de partidos pendientes', async () => {
    partidosRepository.findOne.mockResolvedValue({
      ...partido,
      estado: 'Pendiente',
    });

    await expect(service.crear(datos)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debería impedir registrar dos resultados para el mismo partido', async () => {
    resultadosRepository.findOne.mockResolvedValue({
      id: 1,
      partido,
    });

    await expect(service.crear(datos)).rejects.toThrow(
      ConflictException,
    );
  });

  it('debería obtener todos los resultados ordenados por ID descendente', async () => {
    const resultados = [
      { id: 2, ganador: 'Los Guerreros' },
      { id: 1, ganador: 'Los Campeones' },
    ];

    resultadosRepository.find.mockResolvedValue(resultados);

    const respuesta = await service.buscarTodos();

    expect(respuesta).toEqual(resultados);
    expect(resultadosRepository.find).toHaveBeenCalledWith({
      relations: {
        partido: {
          torneo: true,
          equipoLocal: true,
          equipoVisitante: true,
        },
      },
      order: { id: 'DESC' },
    });
  });

  it('debería obtener un resultado por su ID', async () => {
    const resultado = {
      id: 1,
      partido,
      puntosLocal: 3,
      puntosVisitante: 1,
      ganador: 'Los Campeones',
    };

    resultadosRepository.findOne.mockResolvedValue(resultado);

    const respuesta = await service.buscarPorId(1);

    expect(respuesta).toEqual(resultado);
    expect(resultadosRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        partido: {
          torneo: true,
          equipoLocal: true,
          equipoVisitante: true,
        },
      },
    });
  });

  it('debería rechazar la búsqueda de un resultado inexistente', async () => {
    resultadosRepository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería eliminar un resultado correctamente', async () => {
    const resultado = {
      id: 1,
      partido,
      puntosLocal: 3,
      puntosVisitante: 1,
      ganador: 'Los Campeones',
    };

    resultadosRepository.findOne.mockResolvedValue(resultado);
    resultadosRepository.remove.mockResolvedValue(resultado);

    const respuesta = await service.eliminar(1);

    expect(respuesta).toEqual({
      mensaje: 'Resultado eliminado correctamente',
    });
    expect(resultadosRepository.remove).toHaveBeenCalledWith(resultado);
  });

  it('debería rechazar la eliminación de un resultado inexistente', async () => {
    resultadosRepository.findOne.mockResolvedValue(null);

    await expect(service.eliminar(999)).rejects.toThrow(
      NotFoundException,
    );

    expect(resultadosRepository.remove).not.toHaveBeenCalled();
  });
});
