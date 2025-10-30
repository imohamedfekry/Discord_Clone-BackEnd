import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
  
  interface EmojiOptions {
    min?: number;
    max?: number;
  }
  
  export function IsEmoji(
    emojiOptions?: EmojiOptions,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isEmoji',
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            if (typeof value !== 'string') return false;
  
            const matches = value.match(emojiRegex) || [];
  
            const min = emojiOptions?.min ?? 1;
            const max = emojiOptions?.max ?? 1;
  
            // لازم يكون العدد في الرينج المحدد، ومفيش أي رموز تانية غير الإيموجيات
            return (
              matches.length >= min &&
              matches.length <= max &&
              matches.join('') === value
            );
          },
          defaultMessage(args: ValidationArguments) {
            const min = emojiOptions?.min ?? 1;
            const max = emojiOptions?.max ?? 1;
  
            if (min === max) {
              return `${args.property} must contain exactly ${min} emoji${min > 1 ? 's' : ''}`;
            } else {
              return `${args.property} must contain between ${min} and ${max} emojis`;
            }
          },
        },
      });
    };
  }
  