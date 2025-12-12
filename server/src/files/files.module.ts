import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CanvasModule } from '../canvas/canvas.module';
import { QueueModule } from '../queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { FilesController } from './files.controller';
<<<<<<< HEAD
import { AgentService } from '../agent.service';
=======
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4

@Module({
  imports: [PrismaModule, CanvasModule, QueueModule, AuthModule],
  controllers: [FilesController],
<<<<<<< HEAD
  providers: [FilesService,AgentService],
=======
  providers: [FilesService],
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
  exports: [FilesService],
})
export class FilesModule {}

