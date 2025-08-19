import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { ReportDay } from 'src/domains/organization.entity';

export class OrganizationCreateDto {
  @ApiProperty({ description: 'ID организации', required: false })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  id?: string;

  @ApiProperty({ description: 'Название организации' })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({ description: 'ID родительской организации', required: false })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  parentOrganizationId?: string;

  @ApiProperty({ description: 'Отчетный день', required: false })
  @IsOptional()
  @IsEnum(ReportDay)
  @IsNotEmpty()
  reportDay?: ReportDay;

  @ApiProperty({ description: 'Код цвета организации', example: '#FFFFF' })
  @IsString()
  @IsNotEmpty()
  organizationColor: string;

  @Exclude({ toPlainOnly: true })
  account?: Account;
}
