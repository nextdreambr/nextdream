import { MigrationInterface, QueryRunner, Table } from 'typeorm';

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
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('password_reset_tokens');
    if (hasTable) {
      await queryRunner.dropTable('password_reset_tokens');
    }
  }
}
