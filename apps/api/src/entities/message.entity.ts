import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'varchar' })
  conversationId!: string;

  @Column({ type: 'varchar' })
  senderId!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'boolean', default: false })
  moderated!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= crypto.randomUUID();
  }
}
