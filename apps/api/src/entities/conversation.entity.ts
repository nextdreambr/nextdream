import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  dreamId!: string;

  @Column({ type: 'varchar' })
  patientId!: string;

  @Column({ type: 'varchar' })
  supporterId!: string;

  @Column({ type: 'varchar', default: 'ativa' })
  status!: 'ativa' | 'encerrada';

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
