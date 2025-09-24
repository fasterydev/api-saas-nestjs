import { Controller, Get, Post, Delete, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
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
    });
  }

  @Get('clerkGetUser/:id')
  @Auth(ValidRoles.admin)
  clerkGetUser(@Param('id') id: string) {
    return this.authService.clerkGetUser(id);
  }

  @Post('clerkCreateUser')
  // @Auth(ValidRoles.admin)
  clerkCreateUser() {
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
