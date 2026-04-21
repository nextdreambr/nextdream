import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInstitutionResponsibleFieldsToUsers20260421153000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasResponsibleName = await queryRunner.hasColumn('users', 'institutionResponsibleName');
    if (!hasResponsibleName) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'institutionResponsibleName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    const hasResponsiblePhone = await queryRunner.hasColumn('users', 'institutionResponsiblePhone');
    if (!hasResponsiblePhone) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'institutionResponsiblePhone',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasResponsiblePhone = await queryRunner.hasColumn('users', 'institutionResponsiblePhone');
    if (hasResponsiblePhone) {
      await queryRunner.dropColumn('users', 'institutionResponsiblePhone');
    }

    const hasResponsibleName = await queryRunner.hasColumn('users', 'institutionResponsibleName');
    if (hasResponsibleName) {
      await queryRunner.dropColumn('users', 'institutionResponsibleName');
    }
  }
}
