import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== USER ENDPOINTS ====================

  @Get('me')
  @Auth()
  @ApiOperation({
    summary: 'Obtener datos del usuario autenticado',
    description: 'Retorna la información del usuario actualmente autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario obtenidos exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async getUser(@GetUser() user: User) {
    return this.authService.getUserData(user);
  }

  @Get('users')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Obtener lista de usuarios',
    description: 'Retorna una lista de usuarios de la base de datos local. Requiere rol de administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Se requiere rol de administrador',
  })
  async getUsers() {
    return this.authService.getUsers();
  }

  @Get('users/:id')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Retorna la información de un usuario específico por su ID. Requiere rol de administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Se requiere rol de administrador',
  })
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  // ==================== API KEY ENDPOINTS ====================

  @Post('api-keys')
  @Auth(ValidRoles.user)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva API Key',
    description: 'Crea una nueva API Key para el usuario autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'API Key creada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async createApiKey(@GetUser() user: User) {
    return this.authService.createApiKey(user);
  }

  @Get('api-keys')
  @Auth(ValidRoles.user)
  @ApiOperation({
    summary: 'Obtener API Keys del usuario',
    description: 'Retorna todas las API Keys del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'API Keys obtenidas exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async getApiKeys(@GetUser() user: User) {
    return this.authService.getApiKeys(user);
  }

  @Delete('api-keys/:id')
  @Auth(ValidRoles.user)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar API Key',
    description: 'Elimina una API Key específica del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'API Key eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'API Key no encontrada',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async deleteApiKey(@GetUser() user: User, @Param('id') id: string) {
    return this.authService.deleteApiKey(user, id);
  }
}
