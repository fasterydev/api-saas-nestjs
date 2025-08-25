import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ApiKey } from './entities/apikey.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateUserParams,
  UpdateUserParams,
  UserListParams,
} from './interfaces/user-clerk.type';
import { ClerkClient } from '@clerk/backend';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ApiKey)
    private readonly apikeyRepository: Repository<ApiKey>,

    private readonly jwtService: JwtService,

    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
  ) {}

  // **** CLERK ****
  async clerkGetUsers(params: UserListParams) {
    try {
      const users = await this.clerkClient.users.getUserList(params);
      return users;
    } catch (error) {
      this.logger.error(`Error in clerkGetUsers ${JSON.stringify(params)}`);
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al obtener los usuarios.',
      );
    }
  }
  async clerkGetUser(id: string) {
    try {
      return await this.clerkClient.users.getUser(id);
    } catch (error) {
      this.logger.error(`Error in clerkGetUser ${id}`);
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al obtener el usuario.',
      );
    }
  }
  async clerkCreateUser(params: CreateUserParams) {
    try {
      const user = await this.clerkClient.users.createUser(params);
      return user;
    } catch (error) {
      this.logger.error(
        `Error in clerkCreateUser ${JSON.stringify(params)}`,
        error.stack,
        error.response?.data,
      );
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al crear el usuario.',
      );
    }
  }
  async clerkUpdateUser(id: string, params: UpdateUserParams) {
    try {
      return await this.clerkClient.users.updateUser(id, params);
    } catch (error) {
      this.logger.error(
        `Error in clerkUpdateUser ${id} ${JSON.stringify(params)}`,
        error.stack,
        error.response?.data,
      );
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al actualizar el usuario.',
      );
    }
  }
  async clerkDeleteUser(id: string) {
    try {
      return await this.clerkClient.users.deleteUser(id);
    } catch (error) {
      this.logger.error(`Error in clerkDeleteUser ${id}`);
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al eliminar el usuario.',
      );
    }
  }

  // **** JWT ****
  async register(createUserDto: CreateUserDto) {
    // FIXME: CREAR CONECTAR CON CLERK
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      user.password = '**********';
      return {
        message: 'Usuario registrado con éxito.',
      };
    } catch (error) {
      this.logger.error(`Error in register ${createUserDto.userName}`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }
  }
  async getUsers() {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      this.logger.error(`Error in getUsers`, error.response?.data);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }
  }
  // USER++
  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: { email, isActive: true },
        select: {
          email: true,
          password: true,
          id: true,
          userName: true,
          roles: true,
        },
      });

      if (!user)
        throw new UnauthorizedException('Credenciales inválidas (email)');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credeciales inválidas (password)');
      // delete user.password;
      return {
        ...user,
        accessToken: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.logger.error(`Error in login ${loginUserDto.email}`, error);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }
  }
  // USER++
  async getUserData(user: User) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
      });
      return userData;
    } catch (error) {
      this.logger.error(`Error in getUserData UserId: ${user.id}`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al registrar el usuario.';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al registrar el usuario.',
        );
      }
    }
  }
  // CERRAR SESIÓN
  // REFRESCAR TOKEN
  checkAuthStatus(user: User) {
    const token = this.getJwtToken({ id: user.id });
    return {
      ...user,
      accessToken: token,
    };
  }
  // SERVER++
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  // **** API KEY ****
  async createApiKey(user: User) {
    try {
      const key = uuidv4();
      const apiKey = await this.apikeyRepository.create({
        key: key,
        user: user,
      });
      const newKey = await this.apikeyRepository.save(apiKey);
      newKey.user = {} as User;
      return newKey;
    } catch (error) {
      this.logger.error(`Error in createApiKey ${user.id}`, error);
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al crear la ApiKey.',
      );
    }
  }
  async getApiKeys(user: User) {
    try {
      const apiKeys = await this.apikeyRepository.find({
        where: { user: { id: user.id } },
      });
      return apiKeys;
    } catch (error) {
      this.logger.error(`Error in getApiKeys ${user.id}`, error);
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al obtener las ApiKeys.',
      );
    }
  }
  async deleteApiKey(user: User, id: string) {
    try {
      if (!id) {
        throw new BadRequestException('El ID de la ApiKey es requerido.');
      }

      const apiKey = await this.apikeyRepository.findOne({
        where: {
          id,
          user: { id: user.id },
        },
      });

      if (!apiKey) {
        throw new NotFoundException(
          'No se encontró la ApiKey o no pertenece al usuario.',
        );
      }

      const deleteResult = await this.apikeyRepository.delete({ id });

      if (!deleteResult.affected || deleteResult.affected === 0) {
        throw new InternalServerErrorException(
          'No se pudo eliminar la ApiKey. Es posible que ya haya sido eliminada.',
        );
      }

      return {
        message: `ApiKey eliminada con éxito con el Id ${id}`,
      };
    } catch (error) {
      this.logger.error(`Error en deleteApiKey con id: ${id}`, error.stack);
      throw new InternalServerErrorException(
        error.message || 'Ocurrió un error al eliminar la ApiKey.',
      );
    }
  }
}
