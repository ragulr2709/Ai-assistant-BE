import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('v1/api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unneeded fields
      forbidNonWhitelisted: true, // Throw error for unwanted fields
      transform: true, // Auto-transform payloads to DTO classes
    }),
  );

  // Use the PORT from environment (Render provides this) or fallback to 3000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
}
bootstrap();
