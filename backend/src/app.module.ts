import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuariosModule } from './usuarios/usuarios.module.js';
import { EquiposModule } from './equipos/equipos.module.js';
import { TorneosModule } from './torneos/torneos.module.js';
import { InscripcionesModule } from './inscripciones/inscripciones.module.js';
import { PartidosModule } from './partidos/partidos.module.js';
import { ResultadosModule } from './resultados/resultados.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RankingModule } from './ranking/ranking.module.js';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT') ?? 3306),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    UsuariosModule,
    EquiposModule,
    TorneosModule,
    InscripcionesModule,
    PartidosModule,
    ResultadosModule,
    AuthModule,
    RankingModule,
  ],
})
export class AppModule {}
