import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
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
        error || 'Ocurrió un error al obtener los usuarios.',
      );
    }
  }
  async clerkGetUser(id: string) {
    try {
      return await this.clerkClient.users.getUser(id);
    } catch (error) {
      this.logger.error(`Error in clerkGetUser ${id}`);
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al obtener el usuario.',
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
        error,
      );
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al crear el usuario.',
      );
    }
  }
  async clerkUpdateUser(id: string, params: UpdateUserParams) {
    try {
      return await this.clerkClient.users.updateUser(id, params);
    } catch (error) {
      this.logger.error(
        `Error in clerkUpdateUser ${id} ${JSON.stringify(params)}`,
        error,
      );
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al actualizar el usuario.',
      );
    }
  }
  async clerkDeleteUser(id: string) {
    try {
      return await this.clerkClient.users.deleteUser(id);
    } catch (error) {
      this.logger.error(`Error in clerkDeleteUser ${id}`);
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al eliminar el usuario.',
      );
    }
  }
  // **** DATABASE ****
  async getUsers() {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      this.logger.error(`Error in getUsers`, error);
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al obtener los usuarios.',
      );
    }
  }
  async getUserData(user: User) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
      });
      return userData;
    } catch (error) {
      this.logger.error(`Error in getUserData UserId: ${user.id}`);
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al obtener los datos del usuario.',
      );
    }
  }
  // **** API KEY ****
  async createApiKey(user: User) {
    try {
      const key = uuidv4();
      const apiKey = this.apikeyRepository.create({
        key: key,
        user: user,
      });
      const newKey = await this.apikeyRepository.save(apiKey);
      newKey.user = {} as User;
      return newKey;
    } catch (error) {
      this.logger.error(`Error in createApiKey ${user.id}`, error);
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al crear la ApiKey.',
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
        error || 'Ocurrió un error al obtener las ApiKeys.',
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
      this.logger.error(`Error en deleteApiKey con id: ${id}`, error);
      throw new InternalServerErrorException(
        error || 'Ocurrió un error al eliminar la ApiKey.',
      );
    }
  }
}
