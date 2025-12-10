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
	
	// 从环境变量读取额外的允许域名
	const extraOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
	const allOrigins = [...allowedOrigins, ...extraOrigins];
	
	app.enableCors({
		origin: (origin, callback) => {
			// 允许无 origin 的请求（如 Postman、移动应用）
			if (!origin) {
				callback(null, true);
				return;
			}
			
			// 检查是否在白名单中
			if (allOrigins.includes(origin)) {
				callback(null, true);
			} else {
				// 生产环境记录未授权的请求
				logger.warn(`CORS blocked origin: ${origin}`);
				callback(null, false);
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

