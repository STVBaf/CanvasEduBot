import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CanvasModule } from '../canvas/canvas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, CanvasModule, AuthModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
