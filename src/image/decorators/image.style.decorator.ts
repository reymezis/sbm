import { registerDecorator, ValidationOptions } from 'class-validator';
import { StyleValidationConstraint } from './image.style.validator';

export function IsValidStyle(validationOptions?: ValidationOptions) {
  return function (object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: StyleValidationConstraint,
    });
  };
}
