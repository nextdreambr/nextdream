import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export interface AdminSettingsRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AdminSettingsCategory {
  id: string;
  name: string;
}

export interface AdminInstitutionalText {
  id: string;
  label: string;
  text: string;
}

@Entity('admin_settings')
export class AdminSettings {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ type: 'simple-json' })
  blockedWords!: string[];

  @Column({ type: 'simple-json' })
  rules!: AdminSettingsRule[];

  @Column({ type: 'simple-json' })
  categories!: AdminSettingsCategory[];

  @Column({ type: 'simple-json' })
  institutionalTexts!: AdminInstitutionalText[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  ensureId() {
    this.id ??= 'global';
  }
}
