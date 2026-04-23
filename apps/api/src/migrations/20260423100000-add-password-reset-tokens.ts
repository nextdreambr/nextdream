import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddPasswordResetTokens20260423100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('password_reset_tokens');
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(new Table({
      name: 'password_reset_tokens',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          isPrimary: true,
        },
        {
          name: 'userId',
          type: 'varchar',
        },
        {
          name: 'tokenHash',
          type: 'varchar',
          isUnique: true,
        },
        {
          name: 'expiresAt',
          type: 'timestamp',
        },
        {
          name: 'usedAt',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
        },
      ],
      foreignKeys: [
        {
          columnNames: ['userId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
      indices: [
        new TableIndex({
          name: 'IDX_password_reset_tokens_user_id',
          columnNames: ['userId'],
        }),
        new TableIndex({
          name: 'IDX_password_reset_tokens_expires_at',
          columnNames: ['expiresAt'],
        }),
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('password_reset_tokens');
    if (hasTable) {
      await queryRunner.dropTable('password_reset_tokens');
    }
  }
}
