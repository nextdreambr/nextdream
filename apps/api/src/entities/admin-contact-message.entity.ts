import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type AdminContactMessageStatus = 'novo' | 'em-analise' | 'respondido';

@Entity('admin_contact_messages')
export class AdminContactMessage {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  subject!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', default: 'novo' })
  status!: AdminContactMessageStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
