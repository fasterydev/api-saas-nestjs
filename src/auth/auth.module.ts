import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/apikey.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { ClerkClientProvider } from './providers/clerk-client.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ClerkStrategy,
    ClerkClientProvider,
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, ApiKey]),
    PassportModule.register({ defaultStrategy: ['clerk'] }),
  ],
  exports: [
    TypeOrmModule,
    PassportModule,
    ClerkClientProvider,
  ],
})
export class AuthModule {}
