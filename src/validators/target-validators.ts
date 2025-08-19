import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { State } from 'src/domains/target.entity';

export function IsRequiredIfActive(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredIfActive',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const targetState = (args.object as any).targetState;
          if (targetState === State.ACTIVE) {
            return value != null; // Проверяем, что поле не пустое
          }
          return true; // Если статус не "Активная", пропускаем проверку
        },
        defaultMessage(args: ValidationArguments) {
          return 'Заполните все поля, если хотите сделать задачу активной!';
        },
      },
    });
  };
}
