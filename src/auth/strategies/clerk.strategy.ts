import { verifyToken } from '@clerk/backend';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(AuthService)
    private readonly authService: AuthService,

    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request): Promise<User> {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });

      const userClerk = await this.authService.clerkGetUser(tokenPayload.sub);
      // console.log('userClerk:', userClerk);

      const user = await this.userRepository.findOne({
        where: { clerkId: tokenPayload.sub },
      });

      if (!user && userClerk) {
        const newUser = this.userRepository.create({
          clerkId: tokenPayload.sub,
          email: userClerk.emailAddresses[0].emailAddress,
          // FIMXE: Añadir el resto de campos necesarios
        });
        const savedUser = await this.userRepository.save(newUser);
        console.log('USUARIO CREADO POR Clerk:', savedUser);
        return newUser;
      }

      if (user && !userClerk) {
        throw new UnauthorizedException('Usuario no encontrado en Clerk');
      }

      if (user && userClerk) {
        console.log('USUARIO ENCONTRADO:', user);
        return user;
      }

      throw new UnauthorizedException(
        'Usuario no encontrado en la base de datos',
      );
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Token de Clerk inválido o expirado');
    }
  }
}
