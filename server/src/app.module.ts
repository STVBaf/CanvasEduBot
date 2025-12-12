import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CanvasModule } from './canvas/canvas.module';
import { CoursesModule } from './courses/courses.module';
import { FilesModule } from './files/files.module';
import { QueueModule } from './queue/queue.module';
<<<<<<< HEAD
=======
import { UserModule } from './user/user.module';
import { GroupsModule } from './groups/groups.module';
import { AssignmentsModule } from './assignments/assignments.module';
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
import { FilesProcessor } from './files/files.processor';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		QueueModule,
		AuthModule,
		CanvasModule,
		CoursesModule,
		FilesModule,
<<<<<<< HEAD
=======
		UserModule,
		GroupsModule,
		AssignmentsModule,
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
	],
	providers: [FilesProcessor],
})
export class AppModule {}

