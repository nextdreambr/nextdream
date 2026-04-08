import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type AdminReportStatus = 'aberto' | 'em-analise' | 'resolvido';

@Entity('admin_reports')
export class AdminReport {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  targetType!: string;

  @Column({ type: 'varchar' })
  targetId!: string;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'varchar', default: 'aberto' })
  status!: AdminReportStatus;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
