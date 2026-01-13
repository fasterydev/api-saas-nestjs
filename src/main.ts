import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('🚀 Iniciando aplicación...');

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Configurar prefijo global de la API
    app.setGlobalPrefix(envs.apiPrefix);
    logger.log(`📌 Prefijo de API configurado: /${envs.apiPrefix}`);

    // Configurar validación global
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    logger.log('✅ Validación global configurada');

    // Configurar CORS
    const allowedOrigins = [
      'https://shop.fastery.dev',
      'http://localhost:3000',
    ];
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });
    logger.log(`🌐 CORS habilitado para orígenes: ${allowedOrigins.join(', ')}`);

    // Iniciar servidor
    const port = envs.port || 4000;
    await app.listen(port);

    logger.log('═══════════════════════════════════════════════════════════');
    logger.log(`✅ Aplicación iniciada correctamente`);
    logger.log(`📡 Servidor corriendo en: http://localhost:${port}`);
    logger.log(`🔗 API disponible en: http://localhost:${port}/${envs.apiPrefix}`);
    logger.log(`🌍 Entorno: ${envs.stage}`);
    logger.log(`📅 ${new Date().toLocaleString('es-ES', { timeZone: 'America/Santiago' })}`);
    logger.log('═══════════════════════════════════════════════════════════');
  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación', error?.stack || error);
    process.exit(1);
  }
}

bootstrap();
