import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type AuditSeverity = 'alta' | 'media' | 'baixa';
export type AuditOutcome = 'ok' | 'warn' | 'danger';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ type: 'varchar' })
  by!: string;

  @Column({ type: 'varchar' })
  target!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  severity!: AuditSeverity;

  @Column({ type: 'varchar' })
  outcome!: AuditOutcome;

  @Column({ type: 'text' })
  details!: string;

  @Column({ type: 'varchar' })
  refPath!: string;

  @Column({ type: 'varchar', nullable: true })
  refId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
