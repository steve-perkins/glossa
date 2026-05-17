import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTables1778979165144 implements MigrationInterface {
    name = 'AddUserTables1778979165144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_pref" ("user_id" uuid NOT NULL, "theme" character varying NOT NULL DEFAULT 'cream', "accent" character varying NOT NULL DEFAULT 'terracotta', "density" character varying NOT NULL DEFAULT 'regular', "target_language_id" character varying, CONSTRAINT "PK_6d1526f0929a83582c5c87ec11f" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "app_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "google_sub" character varying NOT NULL, "email" character varying NOT NULL, "display_name" character varying NOT NULL, "avatar_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0d3faaaf597c8d6c3f901958b9d" UNIQUE ("google_sub"), CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_pref" ADD CONSTRAINT "FK_6d1526f0929a83582c5c87ec11f" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_pref" DROP CONSTRAINT "FK_6d1526f0929a83582c5c87ec11f"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
        await queryRunner.query(`DROP TABLE "user_pref"`);
    }

}
