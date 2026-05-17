import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialContentSchema1778972750758 implements MigrationInterface {
    name = 'InitialContentSchema1778972750758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lesson_slide" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lesson_id" character varying NOT NULL, "ordinal" integer NOT NULL, "type" character varying(20) NOT NULL, "payload" jsonb NOT NULL, CONSTRAINT "PK_3e0811ec7c30f4d223464ff23ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lesson" ("id" character varying NOT NULL, "unit_id" character varying NOT NULL, "ordinal" integer NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'locked', CONSTRAINT "PK_0ef25918f0237e68696dee455bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "unit" ("id" character varying NOT NULL, "level_id" character varying NOT NULL, "ordinal" integer NOT NULL, "title" character varying NOT NULL, "subtitle" character varying NOT NULL, CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "story_paragraph" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "story_id" character varying NOT NULL, "ordinal" integer NOT NULL, "target_text" text NOT NULL, "english_text" text NOT NULL, CONSTRAINT "PK_d5a469819f1386bd6c1a65db168" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "story" ("id" character varying NOT NULL, "language_id" character varying NOT NULL, "level_id" character varying NOT NULL, "title" character varying NOT NULL, "native_title" character varying NOT NULL, "glyph" character varying(10) NOT NULL, "minutes" integer NOT NULL, "words" integer NOT NULL, "excerpt" text NOT NULL, CONSTRAINT "PK_28fce6873d61e2cace70a0f3361" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation_scenario" ("id" character varying NOT NULL, "language_id" character varying NOT NULL, "level_id" character varying NOT NULL, "title" character varying NOT NULL, "native_title" character varying NOT NULL, "glyph" character varying(10) NOT NULL, "blurb" text NOT NULL, "character" text NOT NULL, "setting" text NOT NULL, "goal" text NOT NULL, "opener" text NOT NULL, "starters" jsonb NOT NULL, CONSTRAINT "PK_a2685c36c5cf467948a20421f7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "level" ("id" character varying NOT NULL, "language_id" character varying NOT NULL, "name" character varying(2) NOT NULL, "ordinal" integer NOT NULL, CONSTRAINT "PK_d3f1a7a6f09f1c3144bacdc6bcc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "free_chat_mode" ("id" character varying NOT NULL, "language_id" character varying NOT NULL, "kind" character varying(16) NOT NULL, "native_title" character varying NOT NULL, "blurb" text NOT NULL, "openers" text array NOT NULL, "starters" text array NOT NULL, CONSTRAINT "PK_d298ab3e9e09a99f93bd4380b09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "learning_language" ("id" character varying NOT NULL, "name" character varying NOT NULL, "native_name" character varying NOT NULL, "flag_code" character varying(2) NOT NULL, "tts_voice" character varying NOT NULL, CONSTRAINT "PK_8d73531c0a83fed69c9ca38aef5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocab_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "language_id" character varying NOT NULL, "unit_id" character varying, "word" character varying NOT NULL, "romanization" text, "translation" character varying NOT NULL, "unit_title" character varying NOT NULL, "sentence" jsonb NOT NULL, "sentence_full" character varying NOT NULL, "image_url" text, CONSTRAINT "PK_62b71500a3751b8a3dca06d1b3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lesson_slide" ADD CONSTRAINT "FK_16d8254b3bf879d27a1dd157b8b" FOREIGN KEY ("lesson_id") REFERENCES "lesson"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson" ADD CONSTRAINT "FK_826015ed1c4d7024e9ea76aa1ed" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_5039a40b67c5f094537ba5bc4ed" FOREIGN KEY ("level_id") REFERENCES "level"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "story_paragraph" ADD CONSTRAINT "FK_25d1ba51b3b2de4e0c855104ac2" FOREIGN KEY ("story_id") REFERENCES "story"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "story" ADD CONSTRAINT "FK_c3c1d311b8ef5146d9a9e906ddf" FOREIGN KEY ("language_id") REFERENCES "learning_language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "story" ADD CONSTRAINT "FK_494de3a0137651e839a7e8ffcbe" FOREIGN KEY ("level_id") REFERENCES "level"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_scenario" ADD CONSTRAINT "FK_891673f060e238ec99a02295e5d" FOREIGN KEY ("language_id") REFERENCES "learning_language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_scenario" ADD CONSTRAINT "FK_9149ee357e2d4129ca2567ae7db" FOREIGN KEY ("level_id") REFERENCES "level"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "level" ADD CONSTRAINT "FK_cb753da92d19902b98c49a32337" FOREIGN KEY ("language_id") REFERENCES "learning_language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "free_chat_mode" ADD CONSTRAINT "FK_eccd25d1610bb9bbf0ade2603d8" FOREIGN KEY ("language_id") REFERENCES "learning_language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocab_item" ADD CONSTRAINT "FK_dcca5b1a2bee2d2b54489cffeaf" FOREIGN KEY ("language_id") REFERENCES "learning_language"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocab_item" ADD CONSTRAINT "FK_59d25c4970b2b4da504e80d1f7f" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocab_item" DROP CONSTRAINT "FK_59d25c4970b2b4da504e80d1f7f"`);
        await queryRunner.query(`ALTER TABLE "vocab_item" DROP CONSTRAINT "FK_dcca5b1a2bee2d2b54489cffeaf"`);
        await queryRunner.query(`ALTER TABLE "free_chat_mode" DROP CONSTRAINT "FK_eccd25d1610bb9bbf0ade2603d8"`);
        await queryRunner.query(`ALTER TABLE "level" DROP CONSTRAINT "FK_cb753da92d19902b98c49a32337"`);
        await queryRunner.query(`ALTER TABLE "conversation_scenario" DROP CONSTRAINT "FK_9149ee357e2d4129ca2567ae7db"`);
        await queryRunner.query(`ALTER TABLE "conversation_scenario" DROP CONSTRAINT "FK_891673f060e238ec99a02295e5d"`);
        await queryRunner.query(`ALTER TABLE "story" DROP CONSTRAINT "FK_494de3a0137651e839a7e8ffcbe"`);
        await queryRunner.query(`ALTER TABLE "story" DROP CONSTRAINT "FK_c3c1d311b8ef5146d9a9e906ddf"`);
        await queryRunner.query(`ALTER TABLE "story_paragraph" DROP CONSTRAINT "FK_25d1ba51b3b2de4e0c855104ac2"`);
        await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT "FK_5039a40b67c5f094537ba5bc4ed"`);
        await queryRunner.query(`ALTER TABLE "lesson" DROP CONSTRAINT "FK_826015ed1c4d7024e9ea76aa1ed"`);
        await queryRunner.query(`ALTER TABLE "lesson_slide" DROP CONSTRAINT "FK_16d8254b3bf879d27a1dd157b8b"`);
        await queryRunner.query(`DROP TABLE "vocab_item"`);
        await queryRunner.query(`DROP TABLE "learning_language"`);
        await queryRunner.query(`DROP TABLE "free_chat_mode"`);
        await queryRunner.query(`DROP TABLE "level"`);
        await queryRunner.query(`DROP TABLE "conversation_scenario"`);
        await queryRunner.query(`DROP TABLE "story"`);
        await queryRunner.query(`DROP TABLE "story_paragraph"`);
        await queryRunner.query(`DROP TABLE "unit"`);
        await queryRunner.query(`DROP TABLE "lesson"`);
        await queryRunner.query(`DROP TABLE "lesson_slide"`);
    }

}
