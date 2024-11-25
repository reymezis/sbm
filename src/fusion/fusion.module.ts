import { Module } from '@nestjs/common';
import { FusionService } from './fusion.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CronGenerate } from './cron.generate.';
import { CronProcess } from './cron.process';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ConfigModule, PrismaModule, StorageModule],
  providers: [FusionService, CronGenerate, CronProcess],
  exports: [FusionService],
})
export class FusionModule {}
