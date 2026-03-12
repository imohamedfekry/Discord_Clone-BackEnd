import { Type } from 'class-transformer';
import { IsOptional, IsNumberString, Max, Min } from 'class-validator';
import { IsId } from 'src/common/Global/validators/isId.validator';

export class GetMessagesQueryDto {
    @IsOptional()
    @IsNumberString()
    @Type(() => Number)
    @Max(100)
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsNumberString()
    @IsId()
    before?: string;

    @IsOptional()
    @IsNumberString()
    @IsId()
    after?: string;
}