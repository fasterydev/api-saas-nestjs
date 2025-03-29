import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { envs } from 'src/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envs.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    console.log('Token Payload:', payload);
    console.log('ESTRATEGIA - JWT', id);
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) throw new UnauthorizedException('Token no es valido');
      if (!user.isActive)
        throw new UnauthorizedException(
          'Usuario no activo, contacte al administrador',
        );

      return user;
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Error en la autenticación JWT',
      );
    }
  }
}
