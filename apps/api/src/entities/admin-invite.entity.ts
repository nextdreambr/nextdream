import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('admin_invites')
export class AdminInvite {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  tokenHash!: string;

  @Column({ type: 'varchar', nullable: true })
  invitedByUserId?: string;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp' })
  expiresAt!: Date;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
  usedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
