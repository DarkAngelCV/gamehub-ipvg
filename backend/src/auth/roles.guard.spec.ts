import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard.js';
import { ROLES_KEY } from './roles.decorator.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: {
    getAllAndOverride: ReturnType<typeof vi.fn>;
  };

  const crearContexto = (rol?: string) => {
    const request = {
      user: rol ? { rol } : undefined,
    };

    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    };

    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('debería permitir el acceso cuando no se requieren roles', () => {
    reflector.getAllAndOverride.mockReturnValue(null);

    expect(guard.canActivate(crearContexto())).toBe(true);
  });

  it('debería permitir el acceso a un administrador', () => {
    reflector.getAllAndOverride.mockReturnValue(['Admin']);

    expect(guard.canActivate(crearContexto('Admin'))).toBe(true);
  });

  it('debería permitir el acceso a un estudiante cuando corresponde', () => {
    reflector.getAllAndOverride.mockReturnValue(['Admin', 'Student']);

    expect(guard.canActivate(crearContexto('Student'))).toBe(true);
  });

  it('debería denegar el acceso a un estudiante en una ruta de administrador', () => {
    reflector.getAllAndOverride.mockReturnValue(['Admin']);

    expect(guard.canActivate(crearContexto('Student'))).toBe(false);
  });

  it('debería denegar el acceso cuando no existe usuario', () => {
    reflector.getAllAndOverride.mockReturnValue(['Admin']);

    expect(guard.canActivate(crearContexto())).toBe(false);
  });
});
