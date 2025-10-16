import { z } from "zod";
export function zodValidator<T>(schema: z.ZodSchema<T>, data?: any): T {
    const dataToValidate = data ?? process.env;
    const result = schema.safeParse(dataToValidate);
    
    if (!result.success) {
        const errorMessages = result.error.issues.map(issue => 
            `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
    }
    
    return result.data;
}

export function safeZodValidator<T>(schema: z.ZodSchema<T>, data?: any): {
    success: boolean;
    data?: T;
    error?: string;
} {
    const dataToValidate = data ?? process.env;
    const result = schema.safeParse(dataToValidate);
    
    if (!result.success) {
        const errorMessages = result.error.issues.map(issue => 
            `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        return {
            success: false,
            error: errorMessages
        };
    }
    
    return {
        success: true,
        data: result.data
    };
}