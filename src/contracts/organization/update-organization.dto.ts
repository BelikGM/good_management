import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReportDay } from 'src/domains/organization.entity';

export class OrganizationUpdateDto {
  @ApiProperty({ description: 'ID организации' })
  @IsUUID()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({ description: 'Название организации' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  organizationName?: string;

  @ApiProperty({ description: 'Отчетный день' })
  @IsOptional()
  @IsEnum(ReportDay)
  reportDay?: ReportDay;

  @ApiProperty({
    description: 'Список кодов цветов',
    example: { '2d1cea4c-7cea-4811-8cd5-078da7f20167': '#FFFFF' },
  })
  @IsOptional()
  @IsNotEmpty()
  colorCodes?: Record<string, string>;

  @ApiProperty({ description: 'Код цвета организации', example: '#FFFFF' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  organizationColor?: string;

  @ApiProperty({ description: 'ID родительской организации' })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  parentOrganizationId?: string;
}
