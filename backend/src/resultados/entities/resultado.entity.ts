import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Partido } from '../../partidos/entities/partido.entity.js';

@Entity('resultados')
export class Resultado {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Partido, { nullable: false })
  @JoinColumn()
  partido: Partido;

  @Column({ type: 'int', default: 0 })
  puntosLocal: number;

  @Column({ type: 'int', default: 0 })
  puntosVisitante: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ganador: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}
