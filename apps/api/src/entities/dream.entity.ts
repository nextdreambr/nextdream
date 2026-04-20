import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ManagedPatient } from './managed-patient.entity';
import { User } from './user.entity';
import { Proposal } from './proposal.entity';

export type DreamStatus = 'rascunho' | 'publicado' | 'em-conversa' | 'realizando' | 'concluido' | 'pausado' | 'cancelado';
export type DreamFormat = 'remoto' | 'presencial' | 'ambos';
export type DreamUrgency = 'baixa' | 'media' | 'alta';
export type DreamPrivacy = 'publico' | 'verificados' | 'anonimo';

@Entity('dreams')
export class Dream {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar' })
  category!: string;

  @Column({ type: 'varchar' })
  format!: DreamFormat;

  @Column({ type: 'varchar' })
  urgency!: DreamUrgency;

  @Column({ type: 'varchar', default: 'publicado' })
  status!: DreamStatus;

  @Column({ type: 'varchar', default: 'publico' })
  privacy!: DreamPrivacy;

  @ManyToOne(() => User, (user) => user.dreams, { eager: true, onDelete: 'CASCADE' })
  patient?: User;

  @Column({ type: 'varchar' })
  patientId!: string;

  @ManyToOne(() => ManagedPatient, (managedPatient) => managedPatient.dreams, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  managedPatient?: ManagedPatient;

  @Column({ type: 'varchar', nullable: true })
  managedPatientId?: string;

  @OneToMany(() => Proposal, (proposal) => proposal.dream)
  proposals!: Proposal[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
