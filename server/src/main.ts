import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	
	// 启用 CORS 支持前端调用
	const allowedOrigins = [
		'http://localhost:3000',
		'http://localhost:3001', 
		'http://localhost:3002',
		'http://127.0.0.1:3000',
		'http://127.0.0.1:3001',
	];
	
	app.enableCors({
		origin: (origin, callback) => {
			// 允许无 origin 的请求（如 Postman）或白名单中的请求
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(null, true); // 开发环境暂时允许所有
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});
	
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

