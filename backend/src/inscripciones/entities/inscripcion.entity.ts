import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';
import { Torneo } from '../../torneos/entities/torneo.entity.js';

@Entity('inscripciones')
@Unique(['equipo', 'torneo'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Equipo, { nullable: false })
  equipo: Relation<Equipo>;

  @ManyToOne(() => Torneo, (torneo) => torneo.inscripciones, {
    nullable: false,
  })
  torneo: Relation<Torneo>;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Aprobada', 'Rechazada'],
    default: 'Pendiente',
  })
  estado: string;

  @CreateDateColumn()
  fechaInscripcion: Date;
}
