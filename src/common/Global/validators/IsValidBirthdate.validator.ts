import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom decorator: validates a user's birthdate.
 * - Not before 1950
 * - Not in the future
 * - Must be at least 10 years before current year
 */
export function IsValidBirthdate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidBirthdate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!(value instanceof Date)) return false;

          const now = new Date();
          const year = value.getFullYear();
          const currentYear = now.getFullYear();

          // الشروط:
          return (
            year >= 1950 &&
            value < now &&
            year <= currentYear - 10
          );
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Birthdate must be between 1950 and at least 10 years before the current year';
        },
      },
    });
  };
}
