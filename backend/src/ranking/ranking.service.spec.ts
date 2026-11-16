import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RankingService } from './ranking.service.js';

import { Torneo } from '../torneos/entities/torneo.entity.js';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity.js';
import { Resultado } from '../resultados/entities/resultado.entity.js';

describe('RankingService', () => {
  let service: RankingService;

  let torneoRepository: { findOne: ReturnType<typeof vi.fn> };
  let inscripcionRepository: { find: ReturnType<typeof vi.fn> };
  let resultadoRepository: { find: ReturnType<typeof vi.fn> };

  const equipoLocal = {
    id: 1,
    nombre: 'Los Campeones',
    sigla: 'LDC',
  };

  const equipoVisitante = {
    id: 2,
    nombre: 'Los Guerreros',
    sigla: 'LDG',
  };

  const crearResultado = (
    puntosLocal: number,
    puntosVisitante: number,
    estado = 'Finalizado',
  ) => ({
    puntosLocal,
    puntosVisitante,
    partido: {
      torneo: { id: 2 },
      equipoLocal,
      equipoVisitante,
      estado,
    },
  });

  beforeEach(() => {
    torneoRepository = {
      findOne: vi.fn().mockResolvedValue({
        id: 2,
        nombre: 'Torneo FIFA 26',
      }),
    };

    inscripcionRepository = {
      find: vi.fn().mockResolvedValue([
        { equipo: equipoLocal },
        { equipo: equipoVisitante },
      ]),
    };

    resultadoRepository = {
      find: vi.fn().mockResolvedValue([
        crearResultado(3, 1),
      ]),
    };

    service = new RankingService(
      torneoRepository as unknown as Repository<Torneo>,
      inscripcionRepository as unknown as Repository<Inscripcion>,
      resultadoRepository as unknown as Repository<Resultado>,
    );
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería calcular correctamente una victoria', async () => {
    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking[0].equipo).toBe('Los Campeones');
    expect(respuesta.ranking[0].ganados).toBe(1);
    expect(respuesta.ranking[0].puntos).toBe(3);

    expect(respuesta.ranking[1].equipo).toBe('Los Guerreros');
    expect(respuesta.ranking[1].perdidos).toBe(1);
    expect(respuesta.ranking[1].puntos).toBe(0);
  });

  it('debería repartir un punto a cada equipo en caso de empate', async () => {
    resultadoRepository.find.mockResolvedValue([
      crearResultado(2, 2),
    ]);

    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking[0].empatados).toBe(1);
    expect(respuesta.ranking[0].puntos).toBe(1);

    expect(respuesta.ranking[1].empatados).toBe(1);
    expect(respuesta.ranking[1].puntos).toBe(1);
  });

  it('no debería contar partidos que no estén finalizados', async () => {
    resultadoRepository.find.mockResolvedValue([
      crearResultado(3, 1, 'En curso'),
    ]);

    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking[0].partidosJugados).toBe(0);
    expect(respuesta.ranking[1].partidosJugados).toBe(0);
  });

  it('debería consultar solamente las inscripciones aprobadas del torneo', async () => {
    await service.buscarPorTorneo(2);

    expect(inscripcionRepository.find).toHaveBeenCalledWith({
      where: {
        torneo: { id: 2 },
        estado: 'Aprobada',
      },
      relations: {
        equipo: true,
      },
    });
  });

  it('debería lanzar un error si el torneo no existe', async () => {
    torneoRepository.findOne.mockResolvedValue(null);

    await expect(
      service.buscarPorTorneo(999),
    ).rejects.toThrow(NotFoundException);
  });

  it('debería ignorar resultados sin partido asociado', async () => {
    resultadoRepository.find.mockResolvedValue([
      { puntosLocal: 3, puntosVisitante: 1, partido: null },
    ]);

    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking[0].partidosJugados).toBe(0);
    expect(respuesta.ranking[1].partidosJugados).toBe(0);
  });

  it('debería ignorar partidos pertenecientes a otro torneo', async () => {
    resultadoRepository.find.mockResolvedValue([
      {
        ...crearResultado(3, 1),
        partido: {
          ...crearResultado(3, 1).partido,
          torneo: { id: 999 },
        },
      },
    ]);

    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking[0].partidosJugados).toBe(0);
    expect(respuesta.ranking[1].partidosJugados).toBe(0);
  });

  it('debería ignorar partidos cuyos equipos no estén inscritos', async () => {
    inscripcionRepository.find.mockResolvedValue([
      { equipo: equipoLocal },
    ]);

    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking).toHaveLength(1);
    expect(respuesta.ranking[0].partidosJugados).toBe(0);
  });

  it('debería ordenar los equipos por puntos, diferencia y puntos a favor', async () => {
    const equipoTres = {
      id: 3,
      nombre: 'Los Invencibles',
      sigla: 'LDI',
    };

    inscripcionRepository.find.mockResolvedValue([
      { equipo: equipoLocal },
      { equipo: equipoVisitante },
      { equipo: equipoTres },
    ]);

    resultadoRepository.find.mockResolvedValue([
      {
        puntosLocal: 2,
        puntosVisitante: 1,
        partido: {
          torneo: { id: 2 },
          equipoLocal,
          equipoVisitante,
          estado: 'Finalizado',
        },
      },
      {
        puntosLocal: 3,
        puntosVisitante: 2,
        partido: {
          torneo: { id: 2 },
          equipoLocal: equipoTres,
          equipoVisitante,
          estado: 'Finalizado',
        },
      },
    ]);

    const respuesta = await service.buscarPorTorneo(2);

    expect(respuesta.ranking[0].equipo).toBe('Los Invencibles');
    expect(respuesta.ranking[1].equipo).toBe('Los Campeones');
    expect(respuesta.ranking[2].equipo).toBe('Los Guerreros');
  });
});
