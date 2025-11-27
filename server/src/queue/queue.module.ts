import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FILE_QUEUE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        return new Queue('file-download', { connection: { url: redisUrl } });
      },
    },
  ],
  exports: ['FILE_QUEUE'],
})
export class QueueModule {}
