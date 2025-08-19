import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedGraphTypeControlPanel1751971567007 implements MigrationInterface {
    name = 'RemovedGraphTypeControlPanel1751971567007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "post_roleId_fkey"`);
        await queryRunner.query(`ALTER TABLE "control_panel" DROP COLUMN "graphType"`);
        await queryRunner.query(`DROP TYPE "public"."control_panel_graphtype_enum"`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_376552d942487d3c1953ad9304c" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_376552d942487d3c1953ad9304c"`);
        await queryRunner.query(`CREATE TYPE "public"."control_panel_graphtype_enum" AS ENUM('Ежегодовой', '13', '26', '52', 'Ежемесячный', 'Ежедневный')`);
        await queryRunner.query(`ALTER TABLE "control_panel" ADD "graphType" "public"."control_panel_graphtype_enum" NOT NULL DEFAULT 'Ежедневный'`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "post_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
