import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Account } from 'src/domains/account.entity';

export class GroupCreateDto {
  @ApiProperty({ description: 'Название группы', example: 'Название группы' })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({
    description: 'Название выбранного подразделения',
    example: 'Департамент производства',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  groupDivisionName?: string;

  @ApiProperty({
    description: 'Ids юзеров, которых добавить в группу',
    example: [
      '40ac6cc6-bca9-4ab1-859b-01fa0c79b6db',
      '5c993fc6-4e04-4ed1-8404-2aab65096a20',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  groupToUsers: string[];

  @Exclude({ toPlainOnly: true })
  account: Account;
}
