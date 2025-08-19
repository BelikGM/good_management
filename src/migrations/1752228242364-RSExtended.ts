import { MigrationInterface, QueryRunner } from "typeorm";

export class RSExtended1752228242364 implements MigrationInterface {
    name = 'RSExtended1752228242364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."role_setting_module_enum" RENAME TO "role_setting_module_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."role_setting_module_enum" AS ENUM('policy', 'goal', 'objective', 'strategy', 'project', 'post', 'statistic', 'working_plan', 'convert', 'control_panel')`);
        await queryRunner.query(`ALTER TABLE "role_setting" ALTER COLUMN "module" TYPE "public"."role_setting_module_enum" USING "module"::"text"::"public"."role_setting_module_enum"`);
        await queryRunner.query(`DROP TYPE "public"."role_setting_module_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."role_setting_module_enum_old" AS ENUM('policy', 'goal', 'objective', 'strategy', 'project', 'post', 'statistic', 'working_plan', 'convert')`);
        await queryRunner.query(`ALTER TABLE "role_setting" ALTER COLUMN "module" TYPE "public"."role_setting_module_enum_old" USING "module"::"text"::"public"."role_setting_module_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."role_setting_module_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."role_setting_module_enum_old" RENAME TO "role_setting_module_enum"`);
    }

}
