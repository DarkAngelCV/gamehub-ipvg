import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Torneo } from '../../torneos/entities/torneo.entity.js';
import { Equipo } from '../../equipos/entities/equipo.entity.js';

@Entity('partidos')
export class Partido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.partidos, {
    nullable: false,
  })
  torneo: Relation<Torneo>;

  @ManyToOne(() => Equipo, { nullable: false })
  equipoLocal: Relation<Equipo>;

  @ManyToOne(() => Equipo, { nullable: false })
  equipoVisitante: Relation<Equipo>;

  @Column({ type: 'datetime' })
  fechaPartido: Date;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'En curso', 'Finalizado'],
    default: 'Pendiente',
  })
  estado: string;
}
