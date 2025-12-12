import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CanvasModule } from '../canvas/canvas.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		CanvasModule,
		PrismaModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_SECRET') ?? 'changeme',
				signOptions: { expiresIn: '7d' },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard],
	exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

