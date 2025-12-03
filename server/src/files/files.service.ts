import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CanvasService } from '../canvas/canvas.service';
import { Queue } from 'bullmq';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly canvas: CanvasService,
    @Inject('FILE_QUEUE') private readonly fileQueue: Queue,
  ) {}

  async syncCourseFiles(userId: string, courseId: string) {
    const accessToken = await this.canvas.getAccessTokenForUser(userId);
    await this.performSync(userId, accessToken, courseId);
  }

  async syncCourseFilesByToken(accessToken: string, courseId: string) {
    // 1. Get user info from Canvas to ensure we have a user record
    const profile = await this.canvas.getUserProfile(accessToken);
    const email = profile.primary_email || profile.login_id || `canvas_user_${profile.id}@example.com`;
    
    // 2. Find or create user
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.name ?? null,
        },
      });
    }

    // 3. Sync
    await this.performSync(user.id, accessToken, courseId);
  }

  private async performSync(userId: string, accessToken: string, courseId: string) {
    const files = await this.canvas.getCourseFiles(accessToken, courseId);

    for (const f of files) {
      const fileMeta = await this.prisma.fileMeta.upsert({
        where: { canvasFileId: String(f.id) },
        update: {
          fileName: f.display_name ?? f.filename,
          downloadUrl: f.url,
          courseId: String(courseId),
        },
        create: {
          userId,
          courseId: String(courseId),
          canvasFileId: String(f.id),
          fileName: f.display_name ?? f.filename,
          downloadUrl: f.url,
        },
      });

      await this.fileQueue.add('download', {
        fileMetaId: fileMeta.id,
      });
    }
  }
}
