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
import { ManagedPatient } from './managed-patient.entity';
import { Proposal } from './proposal.entity';

export type UserRole = 'paciente' | 'apoiador' | 'instituicao' | 'admin';

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
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  institutionType?: string;

  @Column({ type: 'text', nullable: true })
  institutionDescription?: string;

  @Column({ type: 'boolean', default: true })
  verified!: boolean;

  @Column({ type: 'boolean', default: false })
  approved!: boolean;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'boolean', default: false })
  suspended!: boolean;

  @Column({ type: 'boolean', default: false })
  emailNotificationsEnabled!: boolean;

  @Column({ type: 'integer', default: 0 })
  sessionVersion!: number;

  @Column({ type: 'text', nullable: true })
  suspensionReason?: string;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
  suspendedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Dream, (dream) => dream.patient)
  dreams!: Dream[];

  @OneToMany(() => ManagedPatient, (managedPatient) => managedPatient.institution)
  managedPatients!: ManagedPatient[];

  @OneToMany(() => Proposal, (proposal) => proposal.supporter)
  proposals!: Proposal[];

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
