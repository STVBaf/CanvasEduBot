import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  // Create application context to run background processing providers
  await NestFactory.createApplicationContext(AppModule);
  console.log('Files worker started');
}

bootstrap().catch(err => {
  console.error('Worker failed to start', err);
  process.exit(1);
});
