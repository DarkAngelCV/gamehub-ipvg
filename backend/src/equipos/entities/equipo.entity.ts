import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, unique: true })
  sigla: string;

  @Column({ nullable: true, length: 255 })
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.equipos)
  capitan: Relation<Usuario>;
}
