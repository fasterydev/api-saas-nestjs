import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/apikey.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  Strategy as any,
  'api-key',
) {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {
    super(
      { header: 'Authorization', prefix: 'Api-Key ' },
      true,
      function (apikey, done) {
        return this.validate(apikey, done);
      },
    );
  }

  async validate(apiKey: string, done: Function): Promise<any> {
    console.log('ESTRATEGIA - API KEY', apiKey);
    try {
      const apiKeyEntity = await this.apiKeyRepository.findOne({
        where: { key: apiKey },
        relations: ['user'],
      });

      if (!apiKeyEntity) {
        return done(new UnauthorizedException('Invalid API Key'), false);
      }

      if (!apiKeyEntity.user.isActive) {
        return done(new UnauthorizedException('User is not active'), false);
      }
      const user = apiKeyEntity.user;

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
}
