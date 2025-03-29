import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Auth } from './decorators/auth.decorator';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // **** CLERK ****
  @Get('clerkGetUsers')
  @Auth(ValidRoles.admin)
  clerkGetUsers() {
    return this.authService.clerkGetUsers({
      limit: 10,
      offset: 0,
      // FIXME: Add filters
    });
  }

  @Get('clerkGetUser/:id')
  @Auth(ValidRoles.admin)
  clerkGetUser(@Param('id') id: string) {
    return this.authService.clerkGetUser(id);
  }

  @Post('clerkCreateUser')
  @Auth(ValidRoles.admin)
  clerkCreateUser() {
    // FIXME: CREAR UN DTO SOLO PARA CLERK
    return this.authService.clerkCreateUser({
      emailAddress: ['cj22228@gmail.com'],
      firstName: 'Cristian',
      lastName: 'Jara',
      password: 'Abc12345!',
      createdAt: new Date(),
      externalId: 'cj22228',
      username: 'cristianjara', // Opcional
      // FIXME: Add more fields
    });
  }

  @Patch('clerkUpdateUser/:id')
  // @Auth(ValidRoles.admin)
  clerkUpdateUser(@Param('id') id: string) {
    return this.authService.clerkUpdateUser(id, {
      firstName: 'Cristian',
      lastName: 'Jara',
    });
  }

  @Delete('clerkDeleteUser/:id')
  @Auth(ValidRoles.admin)
  clerkDeleteUser(@Param('id') id: string) {
    return this.authService.clerkDeleteUser(id);
  }

  // **** JWT ****

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('login')
  login(@Query() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // @Get('test')
  // @Auth(ValidRoles.user)
  // test() {
  //   return {
  //     message: 'Test success',
  //   };
  // }

  @Get('getUserData')
  // @Auth()
  getUserData(@GetUser() user: User) {
    return this.authService.getUserData(user);
  }

  @Get('checkAuthStatus')
  @Auth(ValidRoles.user)
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('getUsers')
  @Auth(ValidRoles.user)
  getUsers() {
    return this.authService.getUsers();
  }

  // **** API KEY ****

  @Post('createApiKey')
  @Auth(ValidRoles.user)
  async createApiKey(@GetUser() user: User) {
    return this.authService.createApiKey(user);
  }

  @Get('getApiKeys')
  @Auth(ValidRoles.user)
  async getApiKeys(@GetUser() user: User) {
    return this.authService.getApiKeys(user);
  }

  @Delete('deleteApiKey/:id')
  @Auth(ValidRoles.user)
  async deleteApiKey(@GetUser() user: User, @Param('id') id: string) {
    return this.authService.deleteApiKey(user, id);
  }
}
