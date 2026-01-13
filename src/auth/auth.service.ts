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

  // ==================== CLERK OPERATIONS ====================

  /**
   * Obtiene la lista de usuarios de Clerk con paginación
   * @param params Parámetros de paginación y filtrado
   * @returns Lista de usuarios de Clerk
   */
  async clerkGetUsers(params: UserListParams) {
    try {
      const defaultParams = {
        limit: 10,
        offset: 0,
        ...params,
      };

      const users = await this.clerkClient.users.getUserList(defaultParams);
      
      this.logger.log(
        `Usuarios obtenidos de Clerk: ${users.data.length} de ${users.totalCount}`,
      );

      return users;
    } catch (error) {
      this.logger.error(
        `Error al obtener usuarios de Clerk: ${JSON.stringify(params)}`,
        error?.stack || error,
      );
      throw new InternalServerErrorException(
        error?.message || 'Ocurrió un error al obtener los usuarios de Clerk.',
      );
    }
  }

  /**
   * Obtiene un usuario específico de Clerk por ID
   * @param clerkId ID del usuario en Clerk
   * @returns Usuario de Clerk
   */
  async clerkGetUser(clerkId: string) {
    if (!clerkId) {
      throw new BadRequestException('El ID de Clerk es requerido.');
    }

    try {
      const user = await this.clerkClient.users.getUser(clerkId);
      
      this.logger.log(`Usuario de Clerk obtenido: ${clerkId}`);
      
      return user;
    } catch (error) {
      this.logger.error(
        `Error al obtener usuario de Clerk ${clerkId}`,
        error?.stack || error,
      );

      if (error?.status === 404) {
        throw new NotFoundException(
          `Usuario con ID ${clerkId} no encontrado en Clerk.`,
        );
      }

      throw new InternalServerErrorException(
        error?.message || 'Ocurrió un error al obtener el usuario de Clerk.',
      );
    }
  }

  /**
   * Crea un nuevo usuario en Clerk y sincroniza con la base de datos local
   * @param params Parámetros para crear el usuario
   * @returns Usuario creado en Clerk y sincronizado localmente
   */
  async clerkCreateUser(params: CreateUserParams) {
    try {
      // Validar que el email no exista en la base de datos local
      if (params.emailAddress && params.emailAddress.length > 0) {
        const email = params.emailAddress[0].toLowerCase().trim();
        const existingUser = await this.userRepository.findOne({
          where: { email },
        });

        if (existingUser) {
          throw new BadRequestException(
            `El usuario con email ${email} ya existe en la base de datos.`,
          );
        }
      }

      // Crear usuario en Clerk
      const clerkUser = await this.clerkClient.users.createUser(params);

      if (!clerkUser) {
        throw new InternalServerErrorException(
          'No se pudo crear el usuario en Clerk.',
        );
      }

      // Sincronizar con la base de datos local
      const email =
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        params.emailAddress?.[0] ||
        '';

      const localUserData: Partial<User> = {
        clerkId: clerkUser.id,
        email: email.toLowerCase().trim(),
        firstName: clerkUser.firstName || params.firstName || '',
        lastName: clerkUser.lastName || params.lastName || '',
        userName: clerkUser.username || params.username || '',
        isActive: true,
        roles: ['user'],
      };

      const localUser = this.userRepository.create(localUserData);
      const savedUser = await this.userRepository.save(localUser);

      this.logger.log(
        `Usuario creado en Clerk y sincronizado localmente: ${savedUser.id}`,
      );

      return {
        clerkUser,
        localUser: savedUser,
      };
    } catch (error) {
      this.logger.error(
        `Error al crear usuario en Clerk: ${JSON.stringify(params)}`,
        error?.stack || error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Ocurrió un error al crear el usuario en Clerk.',
      );
    }
  }

  /**
   * Actualiza un usuario en Clerk y sincroniza con la base de datos local
   * @param clerkId ID del usuario en Clerk
   * @param params Parámetros para actualizar el usuario
   * @returns Usuario actualizado en Clerk y sincronizado localmente
   */
  async clerkUpdateUser(clerkId: string, params: UpdateUserParams) {
    if (!clerkId) {
      throw new BadRequestException('El ID de Clerk es requerido.');
    }

    if (!params) {
      throw new BadRequestException('Los parámetros de actualización son requeridos.');
    }

    try {
      // Verificar que el usuario existe en Clerk
      await this.clerkClient.users.getUser(clerkId);

      // Actualizar usuario en Clerk
      const updatedClerkUser = await this.clerkClient.users.updateUser(
        clerkId,
        params,
      );

      if (!updatedClerkUser) {
        throw new InternalServerErrorException(
          'No se pudo actualizar el usuario en Clerk.',
        );
      }

      // Sincronizar con la base de datos local
      const localUser = await this.userRepository.findOne({
        where: { clerkId },
      });

      if (localUser && params) {
        if (params.firstName !== undefined) {
          localUser.firstName = params.firstName;
        }
        if (params.lastName !== undefined) {
          localUser.lastName = params.lastName;
        }
        if (params.username !== undefined) {
          localUser.userName = params.username;
        }

        await this.userRepository.save(localUser);

        this.logger.log(
          `Usuario actualizado en Clerk y sincronizado localmente: ${clerkId}`,
        );

        return {
          clerkUser: updatedClerkUser,
          localUser,
        };
      }

      this.logger.warn(
        `Usuario actualizado en Clerk pero no encontrado localmente: ${clerkId}`,
      );

      return {
        clerkUser: updatedClerkUser,
        localUser: null,
      };
    } catch (error) {
      this.logger.error(
        `Error al actualizar usuario en Clerk ${clerkId}: ${JSON.stringify(params)}`,
        error?.stack || error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error?.status === 404) {
        throw new NotFoundException(
          `Usuario con ID ${clerkId} no encontrado en Clerk.`,
        );
      }

      throw new InternalServerErrorException(
        error?.message || 'Ocurrió un error al actualizar el usuario en Clerk.',
      );
    }
  }

  /**
   * Elimina un usuario de Clerk y de la base de datos local
   * @param clerkId ID del usuario en Clerk
   * @returns Resultado de la eliminación
   */
  async clerkDeleteUser(clerkId: string) {
    if (!clerkId) {
      throw new BadRequestException('El ID de Clerk es requerido.');
    }

    try {
      // Verificar que el usuario existe en Clerk
      await this.clerkClient.users.getUser(clerkId);

      // Eliminar usuario de Clerk
      const deletedClerkUser = await this.clerkClient.users.deleteUser(clerkId);

      // Eliminar usuario de la base de datos local
      const localUser = await this.userRepository.findOne({
        where: { clerkId },
      });

      if (localUser) {
        await this.userRepository.remove(localUser);
        this.logger.log(
          `Usuario eliminado de Clerk y de la base de datos local: ${clerkId}`,
        );
      } else {
        this.logger.warn(
          `Usuario eliminado de Clerk pero no encontrado localmente: ${clerkId}`,
        );
      }

      return {
        message: `Usuario ${clerkId} eliminado exitosamente.`,
        deletedClerkUser,
      };
    } catch (error) {
      this.logger.error(
        `Error al eliminar usuario de Clerk ${clerkId}`,
        error?.stack || error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error?.status === 404) {
        throw new NotFoundException(
          `Usuario con ID ${clerkId} no encontrado en Clerk.`,
        );
      }

      throw new InternalServerErrorException(
        error?.message || 'Ocurrió un error al eliminar el usuario de Clerk.',
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

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario encontrado
   */
  async getUserById(id: string) {
    if (!id) {
      throw new BadRequestException('El ID del usuario es requerido.');
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error al obtener usuario por ID: ${id}`, error?.stack || error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Ocurrió un error al obtener el usuario.',
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
