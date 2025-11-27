import { ConfigService } from '@nestjs/config';
import { QueueEvents, Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class FilesProcessor implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const connectionOptions = {
      url: this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
    };

    const worker = new Worker(
      'file-download',
      async job => {
        if (job.name !== 'download') return;

        const fileMeta = await this.prisma.fileMeta.findUnique({
          where: { id: job.data.fileMetaId },
        });
        if (!fileMeta) return;

        const res = await axios.get(fileMeta.downloadUrl, { responseType: 'stream' });

        const dir = this.config.get<string>('FILE_STORAGE_DIR') ?? './files';
        try {
          mkdirSync(dir, { recursive: true });
        } catch (e) {}
        const path = join(dir, `${fileMeta.id}.bin`);
        const writer = createWriteStream(path);
        res.data.pipe(writer);

        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', err => reject(err));
        });

        await this.prisma.fileMeta.update({
          where: { id: fileMeta.id },
          data: { localPath: path, status: 'done' },
        });
      },
      { connection: connectionOptions },
    );

    const events = new QueueEvents('file-download', { connection: connectionOptions });
    events.on('failed', async ({ jobId, failedReason }) => {
      console.error('job failed', jobId, failedReason);
    });
  }
}
