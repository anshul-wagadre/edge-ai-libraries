import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class VssMigrations1750138985555 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'state',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: false,
        default: '',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
