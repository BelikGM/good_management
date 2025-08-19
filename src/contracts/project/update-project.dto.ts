import { TargetCreateDto } from '../target/create-target.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TargetUpdateDto } from '../target/update-target.dto';
import { Exclude, Type } from 'class-transformer';
import { Strategy } from 'src/domains/strategy.entity';
import {
  HasCommonActiveOrFinished,
  HasProjectIdsForProgram,
} from 'src/validators/project-validator';

export class ProjectUpdateDto {
  @ApiProperty({
    description: 'Id обновляемого проекта',
    required: true,
    example: 'f2c217bc-367b-4d72-99c3-37d725306786',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID проекта не может быть пустым!' })
  _id: string;

  @ApiProperty({
    description: 'Название проекта',
    required: false,
    example: 'Название проекта',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название проекта не может быть пустым!' })
  projectName?: string;

  @ApiProperty({
    description: 'Id программы',
    required: false,
    example: 'b6ed2664-9510-4a47-9117-6ce89903b4b5',
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({
    description: 'Содержание проекта',
    required: false,
    example: 'Контент проекта',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Содержание проекта не может быть пустым!' })
  content?: string;

  @ApiProperty({
    description: 'ID стратегии, которую связать с проектом',
    required: false,
    example: '221cca9a-2633-489c-8f16-cddd411ff2d0',
  })
  @IsOptional()
  @IsUUID()
  strategyId?: string | null;

  @Exclude({ toPlainOnly: true })
  strategy: Strategy;

  @ApiProperty({
    description: 'Список задач',
    required: false,
    example: [
      {
        type: 'Продукт',
        orderNumber: 1,
        content: 'Контент задачи',
        holderPostId: '53e0a8b0-bce4-4c81-b26f-7e5a4ad6e259',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
      {
        type: 'Задача',
        orderNumber: 1,
        content: 'Контент задачи',
        holderPostId: '53e0a8b0-bce4-4c81-b26f-7e5a4ad6e259',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
      {
        type: 'Правила',
        orderNumber: 1,
        content: 'Контент задачи',
        holderPostId: '53e0a8b0-bce4-4c81-b26f-7e5a4ad6e259',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Должен быть массив!' })
  @ValidateNested()
  @Type(() => TargetCreateDto)
  targetCreateDtos?: TargetCreateDto[];

  @ApiProperty({
    description: 'Список задач',
    required: false,
    example: [
      {
        _id: '7a269e8f-26ba-46da-9ef9-e1b17475b6d9',
        content: 'Контент задачи обновленный',
        holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
        dateStart: '2023-09-18T14:59:47.010Z',
        deadline: '2023-09-18T14:59:47.010Z',
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Должен быть массив!' })
  @ValidateNested()
  @Type(() => TargetUpdateDto)
  @HasCommonActiveOrFinished({
    message:
      'Должна быть хотя бы одна задача с типом "Обычная" и статусом "Активная" или "Завершена"!',
  })
  targetUpdateDtos?: TargetUpdateDto[];

  @ApiProperty({
    description:
      'IDs проектов, которые привязать с програмой (юзается только для программ)',
    required: false,
    example: ['865a8a3f-8197-41ee-b4cf-ba432d7fd51f'],
  })
  @IsOptional()
  @IsArray()
  @HasProjectIdsForProgram({
    message: 'Выберите хотя бы один проект для программы!',
  })
  projectIds?: string[];
}
