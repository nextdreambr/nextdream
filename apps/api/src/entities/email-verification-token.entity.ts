import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('email_verification_tokens')
export class EmailVerificationToken {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', unique: true })
  tokenHash!: string;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp' })
  expiresAt!: Date;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
  usedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
