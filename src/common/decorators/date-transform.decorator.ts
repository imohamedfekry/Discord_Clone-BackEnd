import { Transform } from 'class-transformer';
import { ApiPropertyOptions } from '@nestjs/swagger';

/**
 * Transforms Date objects from Prisma to ISO string format
 * Handles Date objects, null, undefined, and empty objects {} from Prisma
 * 
 * Usage:
 * @DateTransform()
 * @ApiProperty({ description: 'Created at', type: String })
 * createdAt: string;
 * 
 * @DateTransform({ nullable: true })
 * @ApiProperty({ description: 'Birthdate', type: String, nullable: true })
 * birthdate?: string | null;
 */
export function DateTransform(options?: { nullable?: boolean }) {
  return Transform(({ value }) => {
    // Handle null/undefined
    if (!value) return options?.nullable ? null : undefined;
    
    // Handle Date objects
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return options?.nullable ? null : undefined;
      return value.toISOString();
    }
    
    // Handle empty objects {} from Prisma serialization issues
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return options?.nullable ? null : undefined;
    }
    
    // Try to convert to Date
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return options?.nullable ? null : undefined;
      return date.toISOString();
    } catch {
      return options?.nullable ? null : undefined;
    }
  });
}

/**
 * Helper to combine DateTransform with ApiProperty for Date fields
 * Makes it even easier to use
 * 
 * Usage:
 * @DateField({ description: 'Created at' })
 * createdAt: string;
 */
export function DateField(apiPropertyOptions?: Omit<ApiPropertyOptions, 'type'> & { nullable?: boolean }) {
  const { nullable, ...apiOptions } = apiPropertyOptions || {};
  
  return function (target: any, propertyKey: string) {
    DateTransform({ nullable })(target, propertyKey);
    // ApiProperty will be applied separately by the user
  };
}

