import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	
	// Optional: Add request logging for debugging
	// app.use((req: any, res: any, next: any) => {
	// 	logger.log(`${req.method} ${req.url}`);
	// 	next();
	// });

	app.useGlobalPipes(new ValidationPipe());
	await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
	logger.log(`Listening on http://localhost:${process.env.PORT ?? 3000}/api`);
}

bootstrap();

