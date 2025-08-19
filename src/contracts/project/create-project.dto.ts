import { Account } from 'src/domains/account.entity';
import { Type as TypeProject } from 'src/domains/project.entity';
import { Strategy } from 'src/domains/strategy.entity';
import { TargetCreateDto } from '../target/create-target.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Organization } from 'src/domains/organization.entity';
import {
  HasProductTask,
  HasStrategyForProgram,
} from 'src/validators/project-validator';
import { Post } from 'src/domains/post.entity';

export class ProjectCreateDto {
  @ApiProperty({
    description: 'Название проекта',
    required: true,
    example: 'Название проекта',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название проекта не может быть пустым!' })
  projectName: string;

  @ApiProperty({
    description: 'Содержание проекта',
    required: true,
    example: 'Контент проекта',
  })
  @IsString()
  @IsNotEmpty({ message: 'Содержание проекта не может быть пустым!' })
  content: string;

  @ApiProperty({
    description: 'Тип проекта',
    required: true,
    default: TypeProject.PROJECT,
    example: 'Проект',
    examples: ['Проект', 'Программа'],
  })
  @IsEnum(TypeProject)
  @IsNotEmpty({ message: 'Выберите тип проекта!' })
  type: TypeProject;

  @ApiProperty({
    description: 'ID организации, которую связать с проектом',
    required: true,
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  @IsUUID(undefined, { message: 'Неверный формат UUID!' })
  organizationId: string;

  @ApiProperty({
    description: 'Id стратегии',
    required: false,
    example: 'd5eaa436-f93f-4743-854a-6f10a5d290a1',
  })
  @HasStrategyForProgram({
    message: 'Для программы обязательно нужно выбрать стратегию!',
  })
  strategyId?: string;

  @Exclude({ toPlainOnly: true })
  strategy: Strategy;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @Exclude({ toPlainOnly: true })
  organization: Organization;

  @Exclude({ toPlainOnly: true })
  postCreator: Post;

  @ApiProperty({
    description: 'Список задач',
    required: true,
    example: [
      {
        type: 'Продукт',
        orderNumber: 1,
        content: 'Контент задачи',
        holderPostId: 'c92895e6-9496-4cb5-aa7b-e3c72c18934a',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
      {
        type: 'Задача',
        orderNumber: 1,
        content: 'Контент задачи',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
      {
        type: 'Правила',
        orderNumber: 1,
        content: 'Контент задачи',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
      {
        type: 'Метрика',
        orderNumber: 1,
        content: 'Контент задачи',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
      {
        type: 'Организационные мероприятия',
        orderNumber: 1,
        content: 'Контент задачи',
        dateStart: '2024-09-18T14:59:47.010Z',
        deadline: '2024-09-18T14:59:47.010Z',
      },
    ],
  })
  @IsArray({ message: 'Должен быть массив!' })
  @ValidateNested()
  @Type(() => TargetCreateDto)
  @HasProductTask({
    message:
      'Список задач должен содержать хотя бы одну задачу с типом "Продукт"!',
  })
  targetCreateDtos: TargetCreateDto[];
}
