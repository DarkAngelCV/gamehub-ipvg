import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { PartidosService } from './partidos.service.js';

import { Partido } from './entities/partido.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity.js';

describe('PartidosService', () => {
  let service: PartidosService;

  let partidosRepository: Record<string, ReturnType<typeof vi.fn>>;
  let torneosRepository: Record<string, ReturnType<typeof vi.fn>>;
  let equiposRepository: Record<string, ReturnType<typeof vi.fn>>;
  let inscripcionesRepository: Record<string, ReturnType<typeof vi.fn>>;

  const torneo = { id: 2, nombre: 'Torneo FIFA 26' };
  const equipoLocal = { id: 1, nombre: 'Los Campeones' };
  const equipoVisitante = { id: 2, nombre: 'Los Guerreros' };

  const datos = {
    torneoId: 2,
    equipoLocalId: 1,
    equipoVisitanteId: 2,
    fechaPartido: '2026-12-05T18:00:00',
  };

  const partido = {
    id: 1,
    torneo,
    equipoLocal,
    equipoVisitante,
    fechaPartido: new Date(datos.fechaPartido),
    estado: 'Pendiente' as 'Pendiente' | 'En curso' | 'Finalizado',
  };

  beforeEach(() => {
    partidosRepository = {
      create: vi.fn().mockImplementation((datos) => datos),
      save: vi.fn().mockImplementation((datos) => ({
        id: 1,
        ...datos,
      })),
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(partido),
      remove: vi.fn().mockResolvedValue(partido),
    };

    torneosRepository = {
      findOneBy: vi.fn().mockResolvedValue(torneo),
    };

    equiposRepository = {
      findOneBy: vi.fn()
        .mockResolvedValueOnce(equipoLocal)
        .mockResolvedValueOnce(equipoVisitante),
    };

    inscripcionesRepository = {
      count: vi.fn().mockResolvedValue(2),
    };

    service = new PartidosService(
      partidosRepository as unknown as Repository<Partido>,
      torneosRepository as unknown as Repository<Torneo>,
      equiposRepository as unknown as Repository<Equipo>,
      inscripcionesRepository as unknown as Repository<Inscripcion>,
    );
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  it('debería crear un partido correctamente', async () => {
    const respuesta = await service.crear(datos);

    expect(respuesta.torneo).toEqual(torneo);
    expect(respuesta.equipoLocal).toEqual(equipoLocal);
    expect(respuesta.equipoVisitante).toEqual(equipoVisitante);
    expect(partidosRepository.save).toHaveBeenCalled();
  });

  it('debería impedir que un equipo juegue contra sí mismo', async () => {
    await expect(
      service.crear({
        ...datos,
        equipoVisitanteId: datos.equipoLocalId,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería rechazar un torneo inexistente', async () => {
    torneosRepository.findOneBy.mockResolvedValue(null);

    await expect(service.crear(datos)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería rechazar un equipo local inexistente', async () => {
    equiposRepository.findOneBy.mockReset();
    equiposRepository.findOneBy.mockResolvedValueOnce(null);

    await expect(service.crear(datos)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería rechazar un equipo visitante inexistente', async () => {
    equiposRepository.findOneBy.mockReset();
    equiposRepository.findOneBy
      .mockResolvedValueOnce(equipoLocal)
      .mockResolvedValueOnce(null);

    await expect(service.crear(datos)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería impedir partidos si los dos equipos no están aprobados', async () => {
    inscripcionesRepository.count.mockResolvedValue(1);

    await expect(service.crear(datos)).rejects.toThrow(
      BadRequestException,
    );
  });


  it('debería devolver todos los partidos', async () => {
    partidosRepository.find.mockResolvedValue([partido]);

    const respuesta = await service.buscarTodos();

    expect(respuesta).toEqual([partido]);
    expect(partidosRepository.find).toHaveBeenCalledWith({
      relations: {
        torneo: true,
        equipoLocal: true,
        equipoVisitante: true,
      },
      order: {
        fechaPartido: 'ASC',
      },
    });
  });

  it('debería encontrar un partido por su ID', async () => {
    const respuesta = await service.buscarPorId(1);

    expect(respuesta).toEqual(partido);
    expect(partidosRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        torneo: true,
        equipoLocal: true,
        equipoVisitante: true,
      },
    });
  });

  it('debería rechazar la búsqueda de un partido inexistente', async () => {
    partidosRepository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId(999)).rejects.toThrow(
      NotFoundException,
    );
  });


  it('debería actualizar la fecha de un partido', async () => {
    const nuevaFecha = '2026-12-10T20:00:00';

    const respuesta = await service.actualizar(1, {
      fechaPartido: nuevaFecha,
    });

    expect(respuesta.fechaPartido).toEqual(new Date(nuevaFecha));
    expect(partidosRepository.save).toHaveBeenCalled();
  });

  it('debería guardar el partido sin cambiar la fecha si no se proporciona', async () => {
    const respuesta = await service.actualizar(1, {});

    expect(respuesta.fechaPartido).toEqual(partido.fechaPartido);
    expect(partidosRepository.save).toHaveBeenCalled();
  });

  it('debería cambiar el estado de un partido', async () => {
    const respuesta = await service.actualizarEstado(1, 'En curso');

    expect(respuesta.estado).toBe('En curso');
    expect(partidosRepository.save).toHaveBeenCalled();
  });

  it('debería permitir marcar un partido como finalizado', async () => {
    const respuesta = await service.actualizarEstado(1, 'Finalizado');

    expect(respuesta.estado).toBe('Finalizado');
  });


  it('debería eliminar un partido existente', async () => {
    const respuesta = await service.eliminar(1);

    expect(respuesta).toEqual({
      mensaje: 'Partido eliminado correctamente',
    });

    expect(partidosRepository.remove).toHaveBeenCalledWith(partido);
  });

  it('debería rechazar la eliminación de un partido inexistente', async () => {
    partidosRepository.findOne.mockResolvedValue(null);

    await expect(service.eliminar(999)).rejects.toThrow(
      NotFoundException,
    );

    expect(partidosRepository.remove).not.toHaveBeenCalled();
  });
});
