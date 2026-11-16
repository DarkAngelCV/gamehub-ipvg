import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuracion = new DocumentBuilder()
    .setTitle('GameHub IPVG API')
    .setDescription(
      'API REST para la gestión de torneos, equipos, inscripciones, partidos y resultados de GameHub IPVG.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el token JWT obtenido al iniciar sesión',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const documento = SwaggerModule.createDocument(app, configuracion);

  SwaggerModule.setup('api', app, documento);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
