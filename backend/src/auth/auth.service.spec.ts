import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  let usuariosRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  const usuario = {
    id: 1,
    nombre: 'Administrador',
    email: 'admin@gamehub.cl',
    password: 'hash-seguro',
    rol: 'Admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    usuariosRepository = {
      findOne: vi.fn().mockResolvedValue(usuario),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('token-de-prueba'),
    };

    service = new AuthService(
      usuariosRepository as unknown as Repository<Usuario>,
      jwtService as unknown as JwtService,
    );
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería iniciar sesión correctamente', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const respuesta = await service.login({
      email: 'admin@gamehub.cl',
      password: 'password123',
    });

    expect(respuesta.access_token).toBe('token-de-prueba');
    expect(respuesta.usuario.rol).toBe('Admin');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
  });

  it('debería rechazar un correo inexistente', async () => {
    usuariosRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'inexistente@gamehub.cl',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debería rechazar una contraseña incorrecta', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'admin@gamehub.cl',
        password: 'incorrecta',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
