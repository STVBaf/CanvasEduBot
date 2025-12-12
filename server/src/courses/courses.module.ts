import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CanvasModule } from '../canvas/canvas.module';
import { AuthModule } from '../auth/auth.module';
<<<<<<< HEAD
import { AssignmentsController } from './assignments.controller';

@Module({
  imports: [PrismaModule, CanvasModule, AuthModule],
  controllers: [
    CoursesController, 
    AssignmentsController
  ],
=======

@Module({
  imports: [PrismaModule, CanvasModule, AuthModule],
  controllers: [CoursesController],
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
  providers: [CoursesService],
})
export class CoursesModule {}
