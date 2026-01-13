import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ClerkUserListDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Número máximo de usuarios a retornar',
    minimum: 1,
    maximum: 500,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Número de usuarios a omitir (paginación)',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    example: 'emailAddress',
    description: 'Campo por el cual ordenar los resultados',
  })
  @IsOptional()
  orderBy?: string;
}
