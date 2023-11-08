import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

export function IsNonEmptyArray(validationOptions?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      name: 'isNonEmptyArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || !Array.isArray(value) || value.length === 0) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Atleast one member should be present to create group';
        },
      },
    });
  };
}
