import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
	console.log(`Listening on http://localhost:${process.env.PORT ?? 3000}/api`);
}

bootstrap();

