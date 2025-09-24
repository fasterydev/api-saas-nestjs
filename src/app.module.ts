import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ssl: { rejectUnauthorized: false },
      url: envs.dbUrl,
      type: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}
