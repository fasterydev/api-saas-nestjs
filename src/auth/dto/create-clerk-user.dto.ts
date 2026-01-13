import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsDate,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClerkUserDto {
  @ApiProperty({
    example: ['user@example.com'],
    description: 'Array de direcciones de correo electrónico del usuario',
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  emailAddress: string[];

  @ApiProperty({
    example: 'John',
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener al menos una letra mayúscula, una minúscula y un número.',
  })
  password: string;

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
    example: 'ext_12345',
    description: 'ID externo para integración con sistemas externos',
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación del usuario',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;
}
