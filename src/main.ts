import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new DatabaseExceptionFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Paga_facil API')
    .setDescription('API de adelanto de nómina')
    .setVersion('1.0')
    .addTag('companies', 'Operaciones para empresas B2B')
    .addTag('employees', 'Operaciones para empleados y cálculo de límites')
    .addTag('advances', 'Operaciones para solicitudes de adelanto de nómina')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get<string>('PORT', '3000'), 10);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
