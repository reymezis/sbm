import { Module } from '@nestjs/common';
import { ImageModule } from './image/image.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { FusionModule } from './fusion/fusion.module';
import { StorageModule } from './storage/storage.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ImageModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    FusionModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
