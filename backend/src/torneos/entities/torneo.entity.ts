import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Inscripcion } from '../../inscripciones/entities/inscripcion.entity.js';
import { Partido } from '../../partidos/entities/partido.entity.js';

@Entity('torneos')
export class Torneo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50 })
  videojuego: string;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ type: 'int' })
  capacidadMaxima: number;

  @Column({ type: 'date' })
  fechaCierreInscripcion: string;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'En curso', 'Finalizado'],
    default: 'Pendiente',
  })
  estado: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.torneo)
  inscripciones: Inscripcion[];

  @OneToMany(() => Partido, (partido) => partido.torneo)
  partidos: Partido[];
}
