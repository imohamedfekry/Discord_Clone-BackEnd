import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  @ValidatorConstraint({ async: false })
  export class IsIdConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
      return typeof value === 'string' && /^\d{17,19}$/.test(value);
    }
  
    defaultMessage(args: ValidationArguments) {
      return `${args.property} must be a valid ID (17-19 digits)`;
    }
  }
  
  export function IsId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsIdConstraint,
      });
    };
  }
  