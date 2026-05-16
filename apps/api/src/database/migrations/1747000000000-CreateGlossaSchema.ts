import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGlossaSchema1747000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS glossa`);
    await queryRunner.query(`SET search_path TO glossa, public`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Dropping the schema would destroy all data; intentionally left as a no-op.
    // Remove the schema manually if you truly need to roll back.
  }
}
