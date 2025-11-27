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
