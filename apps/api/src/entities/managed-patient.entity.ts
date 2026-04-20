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
import { Dream } from './dream.entity';
import { User } from './user.entity';

@Entity('managed_patients')
export class ManagedPatient {
  @PrimaryColumn('varchar')
  id!: string;

  @ManyToOne(() => User, (user) => user.managedPatients, { eager: true, onDelete: 'CASCADE' })
  institution!: User;

  @Column({ type: 'varchar' })
  institutionId!: string;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  linkedUser?: User;

  @Column({ type: 'varchar', nullable: true })
  linkedUserId?: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @OneToMany(() => Dream, (dream) => dream.managedPatient)
  dreams!: Dream[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
