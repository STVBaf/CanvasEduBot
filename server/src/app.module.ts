import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CanvasModule } from './canvas/canvas.module';
import { CoursesModule } from './courses/courses.module';
import { FilesModule } from './files/files.module';
import { QueueModule } from './queue/queue.module';
import { UserModule } from './user/user.module';
import { GroupsModule } from './groups/groups.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { FilesProcessor } from './files/files.processor';
import { AgentService } from './agent/agent.service';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		QueueModule,
		AuthModule,
		CanvasModule,
		CoursesModule,
		FilesModule,
		UserModule,
		GroupsModule,
		AssignmentsModule,
	],
	providers: [FilesProcessor,AgentService],
})
export class AppModule {}

