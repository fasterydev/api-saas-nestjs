import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateClerkUserDto {
  @ApiPropertyOptional({
    example: 'John',
    description: 'Nombre del usuario',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Apellido del usuario',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Nombre de usuario único',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo del usuario',
  })
  @IsOptional()
  @IsBoolean()
  publicMetadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: {},
    description: 'Metadatos privados del usuario',
  })
  @IsOptional()
  privateMetadata?: Record<string, any>;
}
