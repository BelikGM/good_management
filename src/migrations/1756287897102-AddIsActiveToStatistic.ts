import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToStatistic1756287897102 implements MigrationInterface {
    name = 'AddIsActiveToStatistic1756287897102'
    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`ALTER TABLE "statistic" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistic" DROP COLUMN "isActive"`);
    }

}
