import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { InscripcionesService } from './inscripciones.service.js';

import { Inscripcion } from './entities/inscripcion.entity.js';
import { Equipo } from '../equipos/entities/equipo.entity.js';
import { Torneo } from '../torneos/entities/torneo.entity.js';

describe('InscripcionesService', () => {
  let service: InscripcionesService;

  let inscripcionesRepository: Record<string, ReturnType<typeof vi.fn>>;
  let equiposRepository: Record<string, ReturnType<typeof vi.fn>>;
  let torneosRepository: Record<string, ReturnType<typeof vi.fn>>;

  const equipo = {
    id: 1,
    nombre: 'Los Campeones',
    sigla: 'LDC',
  };

  const torneo = {
    id: 2,
    nombre: 'Torneo FIFA 26',
    estado: 'Pendiente',
    fechaCierreInscripcion: '2099-12-31',
    capacidadMaxima: 2,
  };

  const datos = {
    equipoId: 1,
    torneoId: 2,
  };

  const inscripcion = {
    id: 1,
    equipo,
    torneo,
    estado: 'Pendiente' as 'Pendiente' | 'Aprobada' | 'Rechazada',
  };

  beforeEach(() => {
    equiposRepository = {
      findOneBy: vi.fn().mockResolvedValue(equipo),
    };

    torneosRepository = {
      findOneBy: vi.fn().mockResolvedValue(torneo),
    };

    inscripcionesRepository = {
      findOne: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation((datos) => datos),
      save: vi.fn().mockImplementation((datos) => ({
        id: 1,
        ...datos,
      })),
      find: vi.fn().mockResolvedValue([]),
      remove: vi.fn().mockResolvedValue(inscripcion),
    };

    service = new InscripcionesService(
      inscripcionesRepository as unknown as Repository<Inscripcion>,
      equiposRepository as unknown as Repository<Equipo>,
      torneosRepository as unknown as Repository<Torneo>,
    );
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });


  it('debería crear una inscripción correctamente', async () => {
    const respuesta = await service.crear(datos);

    expect(respuesta.equipo).toEqual(equipo);
    expect(respuesta.torneo).toEqual(torneo);
    expect(inscripcionesRepository.save).toHaveBeenCalled();
  });

  it('debería rechazar un equipo inexistente', async () => {
    equiposRepository.findOneBy.mockResolvedValue(null);

    await expect(service.crear(datos)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería rechazar un torneo inexistente', async () => {
    torneosRepository.findOneBy.mockResolvedValue(null);

    await expect(service.crear(datos)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debería impedir inscripciones duplicadas', async () => {
    inscripcionesRepository.findOne.mockResolvedValue({
      id: 1,
      equipo,
      torneo,
    });

    await expect(service.crear(datos)).rejects.toThrow(
      ConflictException,
    );
  });

  it('debería contar las inscripciones pendientes y aprobadas para la capacidad', async () => {
    inscripcionesRepository.count.mockResolvedValue(2);

    await expect(service.crear(datos)).rejects.toThrow(
      BadRequestException,
    );

    expect(inscripcionesRepository.count).toHaveBeenCalledWith({
      where: {
        torneo: { id: torneo.id },
        estado: expect.any(Object),
      },
    });
  });

  it('debería permitir una inscripción cuando todavía hay cupos disponibles', async () => {
    inscripcionesRepository.count.mockResolvedValue(1);

    const respuesta = await service.crear(datos);

    expect(respuesta.equipo).toEqual(equipo);
    expect(inscripcionesRepository.save).toHaveBeenCalled();
  });

  it('debería impedir inscripciones en un torneo iniciado', async () => {
    torneosRepository.findOneBy.mockResolvedValue({
      ...torneo,
      estado: 'En curso',
    });

    await expect(service.crear(datos)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debería impedir inscripciones después del cierre', async () => {
    torneosRepository.findOneBy.mockResolvedValue({
      ...torneo,
      fechaCierreInscripcion: '2000-01-01',
    });

    await expect(service.crear(datos)).rejects.toThrow(
      BadRequestException,
    );
  });


  it('debería devolver todas las inscripciones', async () => {
    inscripcionesRepository.find.mockResolvedValue([inscripcion]);

    const respuesta = await service.buscarTodos();

    expect(respuesta).toEqual([inscripcion]);
    expect(inscripcionesRepository.find).toHaveBeenCalledWith({
      relations: {
        equipo: true,
        torneo: true,
      },
      order: {
        fechaInscripcion: 'DESC',
      },
    });
  });

  it('debería encontrar una inscripción por su ID', async () => {
    inscripcionesRepository.findOne.mockResolvedValue(inscripcion);

    const respuesta = await service.buscarPorId(1);

    expect(respuesta).toEqual(inscripcion);
    expect(inscripcionesRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        equipo: true,
        torneo: true,
      },
    });
  });

  it('debería rechazar la búsqueda de una inscripción inexistente', async () => {
    inscripcionesRepository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId(999)).rejects.toThrow(
      NotFoundException,
    );
  });


  it('debería actualizar el estado de una inscripción', async () => {
    const pendiente = {
      ...inscripcion,
      estado: 'Pendiente' as const,
    };

    inscripcionesRepository.findOne.mockResolvedValue(pendiente);

    const respuesta = await service.actualizarEstado(1, 'Rechazada');

    expect(respuesta.estado).toBe('Rechazada');
    expect(inscripcionesRepository.save).toHaveBeenCalled();
  });

  it('debería aprobar una inscripción cuando hay capacidad disponible', async () => {
    const pendiente = {
      ...inscripcion,
      estado: 'Pendiente' as const,
    };

    inscripcionesRepository.findOne.mockResolvedValue(pendiente);
    inscripcionesRepository.count.mockResolvedValue(0);

    const respuesta = await service.actualizarEstado(1, 'Aprobada');

    expect(respuesta.estado).toBe('Aprobada');
    expect(inscripcionesRepository.count).toHaveBeenCalledWith({
      where: {
        torneo: { id: torneo.id },
        estado: expect.any(Object),
        id: expect.any(Object),
      },
    });
  });

  it('debería impedir aprobar una inscripción si el torneo está lleno', async () => {
    const pendiente = {
      ...inscripcion,
      estado: 'Pendiente' as const,
    };

    inscripcionesRepository.findOne.mockResolvedValue(pendiente);
    inscripcionesRepository.count.mockResolvedValue(2);

    await expect(
      service.actualizarEstado(1, 'Aprobada'),
    ).rejects.toThrow(BadRequestException);

    expect(inscripcionesRepository.save).not.toHaveBeenCalled();
  });

  it('no debería volver a contar los cupos si la inscripción ya está aprobada', async () => {
    const aprobada = {
      ...inscripcion,
      estado: 'Aprobada' as const,
    };

    inscripcionesRepository.findOne.mockResolvedValue(aprobada);

    const respuesta = await service.actualizarEstado(1, 'Aprobada');

    expect(respuesta.estado).toBe('Aprobada');
    expect(inscripcionesRepository.count).not.toHaveBeenCalled();
  });


  it('debería eliminar una inscripción existente', async () => {
    inscripcionesRepository.findOne.mockResolvedValue(inscripcion);

    const respuesta = await service.eliminar(1);

    expect(respuesta).toEqual({
      mensaje: 'Inscripción eliminada correctamente',
    });

    expect(inscripcionesRepository.remove).toHaveBeenCalledWith(
      inscripcion,
    );
  });

  it('debería rechazar la eliminación de una inscripción inexistente', async () => {
    inscripcionesRepository.findOne.mockResolvedValue(null);

    await expect(service.eliminar(999)).rejects.toThrow(
      NotFoundException,
    );

    expect(inscripcionesRepository.remove).not.toHaveBeenCalled();
  });
});
