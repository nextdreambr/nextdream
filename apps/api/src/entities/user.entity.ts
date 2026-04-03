import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dream } from './dream.entity';
import { Proposal } from './proposal.entity';

export type UserRole = 'paciente' | 'apoiador' | 'admin';

@Entity('users')
export class User {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'varchar' })
  role!: UserRole;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'boolean', default: true })
  verified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Dream, (dream) => dream.patient)
  dreams!: Dream[];

  @OneToMany(() => Proposal, (proposal) => proposal.supporter)
  proposals!: Proposal[];

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
