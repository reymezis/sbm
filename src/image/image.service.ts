import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { S3clientService } from '../storage/s3client.service';
import { Readable } from 'stream';
import { ImageQuery } from './image.query';

@Injectable()
export class ImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: S3clientService,
  ) {}

  async generateImage(text: string, style: string) {
    const image = await this.prismaService.image.create({
      data: { prompt: text, status: Status.initial, style },
    });

    return {
      id: image.id,
    };
  }

  async checkStatus(id: string) {
    const image = await this.prismaService.image.findUnique({
      where: { id },
      select: {
        status: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async findById(id: string, { min }, res) {
    const image = await this.prismaService.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const imageKey = this.storageService.getKey(image.aiId, min);
    const stream = await this.storageService.getFile(imageKey);
    res.setHeader('Content-Type', res.ContentType || 'image/webp');
    if (stream instanceof Readable) {
      stream.pipe(res);
    }
  }

  async find({ page, limit }: ImageQuery) {
    const skip = (page - 1) * limit;
    const images = await this.prismaService.image.findMany({
      take: limit,
      skip,
      select: {
        id: true,
        prompt: true,
        style: true,
        status: true,
        urlSized: true,
        createdAt: true,
      },
    });

    const totalCount = await this.prismaService.image.count();

    return {
      images,
      totalCount,
    };
  }
}
