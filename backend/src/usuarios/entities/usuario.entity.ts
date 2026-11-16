import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity.js';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['Admin', 'Student'], default: 'Student' })
  rol: string;

  @CreateDateColumn()
  fechaRegistro: Date;

  @OneToMany(() => Equipo, (equipo) => equipo.capitan)
  equipos: Equipo[];
}
