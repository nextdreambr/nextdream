import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Dream } from './dream.entity';
import { User } from './user.entity';

export type ProposalStatus = 'enviada' | 'em-analise' | 'aceita' | 'recusada' | 'expirada';

@Entity('proposals')
export class Proposal {
  @PrimaryColumn('varchar')
  id!: string;

  @ManyToOne(() => Dream, (dream) => dream.proposals, { eager: true, onDelete: 'CASCADE' })
  dream!: Dream;

  @Column({ type: 'varchar' })
  dreamId!: string;

  @ManyToOne(() => User, (user) => user.proposals, { eager: true, onDelete: 'CASCADE' })
  supporter!: User;

  @Column({ type: 'varchar' })
  supporterId!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar' })
  offering!: string;

  @Column({ type: 'varchar' })
  availability!: string;

  @Column({ type: 'varchar' })
  duration!: string;

  @Column({ type: 'varchar', default: 'enviada' })
  status!: ProposalStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
