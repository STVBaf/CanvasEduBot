import { Module } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [ConfigModule, PrismaModule],
	providers: [CanvasService],
	exports: [CanvasService],
})
export class CanvasModule {}

