import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { ProjectCreateDto } from 'src/contracts/project/create-project.dto';
import { TargetCreateDto } from 'src/contracts/target/create-target.dto';
import { Type as TypeProject } from 'src/domains/project.entity';
import { State, Type } from 'src/domains/target.entity';

export function HasProjectIdsForProgram(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'HasProjectIdsForProgram',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: TargetCreateDto[], args: ValidationArguments) {
          // Получаем объект DTO и проверяем тип
          const dto = args.object as any;
          if (dto.type !== TypeProject.PROGRAM) {
            return true; // Пропускаем валидацию, если тип не PROGRAM
          }

          const hasActiveProductTask = value.some(
            (task) =>
              task.type === Type.PRODUCT && task.targetState === State.ACTIVE,
          );
          // Проверка, что projectIds содержит хотя бы один элемент
          const hasProjectIds =
            Array.isArray(dto.projectIds) && dto.projectIds.length > 0;

          return hasProjectIds && hasActiveProductTask;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Выберите хотя бы один проект для программы!'; // ДОБАВИТЬ ШО СТАТУС ПРОДУКТ АКТИВЕН
        },
      },
    });
  };
}

export function HasProductTask(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'HasProductTaskForProgram',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Получаем объект DTO и проверяем тип
          const dto = args.object as ProjectCreateDto;
          // Проверка, что в targetCreateDtos есть задача типа "Продукт"
          const hasProductTask =
            Array.isArray(dto.targetCreateDtos) &&
            dto.targetCreateDtos.some((task) => task.type === Type.PRODUCT);
          return hasProductTask;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Для программы список задач должен содержать хотя бы одну задачу с типом "Продукт"!'; // СДЕЛАТЬ УНИВЕРСАЛЬНЫМ ДЛЯ ВСЕХ ТИПО проектов
        },
      },
    });
  };
}

export function HasStrategyForProgram(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'HasStrategyForProgram',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: TargetCreateDto[], args: ValidationArguments) {
          // Получаем объект DTO и проверяем тип
          const dto = args.object as any;
          if (dto.type !== TypeProject.PROGRAM) {
            return true; // Пропускаем валидацию, если тип не PROGRAM
          }

          const hasStrategy = dto.strategyId !== undefined ? true : false;
          return hasStrategy;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Для программы обязательно нужно выбрать стратегию!';
        },
      },
    });
  };
}

export function HasCommonActiveOrFinished(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'HasCommonActiveOrFinished',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: TargetCreateDto[], args: ValidationArguments) {
          // Получаем объект DTO и проверяем тип
          const dto = args.object as any;
          if (dto.type !== TypeProject.PROJECT) {
            return true;
          }
          // Проверка, что в targetCreateDtos есть задача типа "Продукт"
          const hasCommonInCreateDtos =
            Array.isArray(dto.targetCreateDtos) &&
            dto.targetCreateDtos.some((task) => task.type === Type.COMMON);
          if (hasCommonInCreateDtos) return true;
          const hasCommonInUpdateDtos =
            Array.isArray(dto.targetUpdateDtos) &&
            dto.targetUpdateDtos.some(
              (task) =>
                task.type === Type.COMMON &&
                (task.targetState === State.ACTIVE ||
                  task.targetState === State.FINISHED),
            );

          return hasCommonInUpdateDtos;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Должна быть хотя бы одна задача с типом "Обычная" и статусом "Активная" или "Завершена!"';
        },
      },
    });
  };
}
