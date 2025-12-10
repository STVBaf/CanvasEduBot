import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CanvasModule } from '../canvas/canvas.module';
import { QueueModule } from '../queue/queue.module';
import { AuthModule } from '../auth/auth.module';
import { FilesController } from './files.controller';
import { AgentService } from '../agent.service';

@Module({
  imports: [PrismaModule, CanvasModule, QueueModule, AuthModule],
  controllers: [FilesController],
  providers: [FilesService,AgentService],
  exports: [FilesService],
})
export class FilesModule {}

