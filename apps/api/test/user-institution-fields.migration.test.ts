import { afterEach, describe, expect, it } from 'vitest';
import { DataSource, Table } from 'typeorm';
import { AddInstitutionResponsibleFieldsToUsers20260421153000 } from '../src/migrations/20260421153000-add-institution-responsible-fields-to-users';

describe('AddInstitutionResponsibleFieldsToUsers20260421153000', () => {
  let dataSource: DataSource | null = null;

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    dataSource = null;
  });

  it('adds and removes institution responsible columns on users', async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      synchronize: false,
      entities: [],
    });

    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'passwordHash', type: 'varchar' },
          { name: 'role', type: 'varchar' },
        ],
      }),
    );

    const migration = new AddInstitutionResponsibleFieldsToUsers20260421153000();
    await migration.up(queryRunner);

    const migratedTable = await queryRunner.getTable('users');
    expect(migratedTable?.findColumnByName('institutionResponsibleName')).toBeDefined();
    expect(migratedTable?.findColumnByName('institutionResponsiblePhone')).toBeDefined();

    await migration.down(queryRunner);

    const revertedTable = await queryRunner.getTable('users');
    expect(revertedTable?.findColumnByName('institutionResponsibleName')).toBeUndefined();
    expect(revertedTable?.findColumnByName('institutionResponsiblePhone')).toBeUndefined();

    await queryRunner.release();
  });
});
