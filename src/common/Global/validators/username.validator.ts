import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  const USERNAME_REGEX = /^[a-zA-Z0-9._]+$/;
  const RESERVED = ['admin', 'support', 'discord', 'system'];

  @ValidatorConstraint({ async: false })
  export class IsUsernameConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
      if (typeof value !== 'string') {
        return false;
      }

      const username = value.trim();
      
      // Check length
      if (username.length < 3) {
        return false;
      }
      
      if (username.length > 32) {
        return false;
      }
      
      // Check reserved words
      if (RESERVED.includes(username.toLowerCase())) {
        return false;
      }
      
      // Check format
      if (!USERNAME_REGEX.test(username)) {
        return false;
      }
      
      return true;
    }

    defaultMessage(args: ValidationArguments) {
      const value = args.value;
      
      if (typeof value !== 'string') {
        return 'Username must be a string';
      }

      const username = value.trim();
      
      // Check length
      if (username.length < 3) {
        return 'Username must be at least 3 characters long';
      }
      
      if (username.length > 32) {
        return 'Username must be at most 32 characters long';
      }
      
      // Check reserved words
      if (RESERVED.includes(username.toLowerCase())) {
        return `Username '${username}' is reserved and cannot be used`;
      }
      
      // Check format
      if (!USERNAME_REGEX.test(username)) {
        return 'Username can only contain letters, numbers, underscores, and dots';
      }
      
      return 'Invalid username';
    }
  }

  export function IsUsername(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsUsernameConstraint,
      });
    };
  }