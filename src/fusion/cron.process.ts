import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import axios from 'axios';
import { GeneratedResponse } from './fusion.interface';
import { S3clientService } from '../storage/s3client.service';
import { FusionService } from './fusion.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronProcess {
  private axiosHeaders = {};
  private batchSize = 5;
  private idsMap = new Map();
  private originalMap = new Map();
  private resizedMap = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: S3clientService,
    private readonly fusionService: FusionService,
    private readonly configService: ConfigService,
  ) {
    this.axiosHeaders['X-Key'] = configService.get('FUSION_KEY');
    this.axiosHeaders['X-Secret'] = configService.get('FUSION_SECRET');
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    try {
      const processImages = await this.prisma.image.findMany({
        where: { status: Status.generating },
        take: this.batchSize,
        orderBy: { createdAt: 'asc' },
      });

      if (processImages.length === 0) {
        return;
      }

      processImages.forEach((image) => {
        this.idsMap.set(image.aiId, image.id);
      });

      const psRequests = processImages.map((image) =>
        this.checkGeneration(image.aiId),
      );

      const results = (await Promise.allSettled(psRequests)) as {
        status: 'fulfilled' | 'rejected';
        value: { data: GeneratedResponse };
      }[];

      const imagesData = results
        .filter(
          (res) =>
            res.status === 'fulfilled' && res.value.data?.status === 'DONE',
        )
        .map((res) => res.value.data);

      if (imagesData.length === 0) {
        return;
      }

      const updateProcessData = imagesData.reduce((acc, item) => {
        acc.push({
          id: this.idsMap.get(item.uuid),
          data: {
            status: Status.processing,
          },
        });
        return acc;
      }, []);

      await this.prisma.$transaction(
        updateProcessData.map((image) =>
          this.prisma.image.update({
            where: { id: image.id },
            data: image.data,
          }),
        ),
      );

      const convertedImages = await Promise.all(
        imagesData.map(async (imageItem) => {
          return {
            image: await this.fusionService.convertImage(imageItem.images[0]),
            name: imageItem.uuid,
            aiId: imageItem.uuid,
          };
        }),
      );

      await Promise.all(
        convertedImages.map(async (imageItem) => {
          this.originalMap.set(
            imageItem.aiId,
            await this.storageService.uploadImage(
              imageItem.image,
              imageItem.name,
            ),
          );
        }),
      );

      await Promise.all(
        convertedImages.map(async (imageItem) => {
          const resizedName = `${imageItem.name}-128x128`;
          this.resizedMap.set(
            imageItem.aiId,
            await this.storageService.uploadImage(
              await this.fusionService.resizeImage(imageItem.image),
              resizedName,
            ),
          );
        }),
      );

      const updateData = convertedImages.map(({ aiId }) => ({
        id: this.idsMap.get(aiId),
        data: {
          status: Status.done,
          url: this.originalMap.get(aiId),
          urlSized: this.resizedMap.get(aiId),
        },
      }));

      await this.prisma.$transaction(
        updateData.map((image) =>
          this.prisma.image.update({
            where: { id: image.id },
            data: image.data,
          }),
        ),
      );
    } catch (e) {
      console.error('cron process error', e);
    }
  }

  async checkGeneration(id: string) {
    return axios.get(
      `https://api-key.fusionbrain.ai/key/api/v1/text2image/status/${id}`,
      {
        headers: this.axiosHeaders,
      },
    );
  }
}
