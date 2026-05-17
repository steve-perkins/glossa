import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProgressTables1778984914877 implements MigrationInterface {
    name = 'AddProgressTables1778984914877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_vocab_srs" ("user_id" character varying NOT NULL, "vocab_item_id" character varying NOT NULL, "ease" double precision NOT NULL DEFAULT '2.5', "interval_days" double precision NOT NULL DEFAULT '0', "due_at" TIMESTAMP WITH TIME ZONE NOT NULL, "last_result" integer NOT NULL DEFAULT '0', "repetitions" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_c0575f0b28889e0dc5635f332b8" PRIMARY KEY ("user_id", "vocab_item_id"))`);
        await queryRunner.query(`CREATE TABLE "user_story_progress" ("user_id" character varying NOT NULL, "story_id" character varying NOT NULL, "read_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dab5a7dee3c568f995fdd9704e1" PRIMARY KEY ("user_id", "story_id"))`);
        await queryRunner.query(`CREATE TABLE "user_lesson_progress" ("user_id" character varying NOT NULL, "lesson_id" character varying NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'in_progress', "last_slide_ordinal" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca7535b366966615043ad206d59" PRIMARY KEY ("user_id", "lesson_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_lesson_progress"`);
        await queryRunner.query(`DROP TABLE "user_story_progress"`);
        await queryRunner.query(`DROP TABLE "user_vocab_srs"`);
    }

}
