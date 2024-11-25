import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FusionModule } from '../fusion/fusion.module';
import { StorageModule } from '../storage/storage.module';
import { StyleValidationConstraint } from './decorators/image.style.validator';

@Module({
  imports: [PrismaModule, FusionModule, StorageModule],
  controllers: [ImageController],
  providers: [ImageService, StyleValidationConstraint],
})
export class ImageModule {}
