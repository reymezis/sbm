import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import axios from 'axios';
import * as FormData from 'form-data';
import { InitialResponse } from './fusion.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronGenerate {
  private batchSize = 5;
  private axiosHeaders = {};
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.axiosHeaders['X-Key'] = configService.get('FUSION_KEY');
    this.axiosHeaders['X-Secret'] = configService.get('FUSION_SECRET');
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    try {
      const initialImages = await this.prisma.image.findMany({
        where: { status: Status.initial },
        take: this.batchSize,
        orderBy: { createdAt: 'asc' },
      });

      if (initialImages.length === 0) {
        return;
      }

      const ids: string[] = initialImages.map((image) => image.id);

      const psRequests = initialImages.map((image) =>
        this.initGeneration(image.prompt, image.style),
      );

      const results = (await Promise.allSettled(psRequests)) as {
        status: 'fulfilled' | 'rejected';
        value: { data: InitialResponse };
      }[];

      const initialData = results
        .filter(
          (res) =>
            res.status === 'fulfilled' && res.value.data.status === 'INITIAL',
        )
        .map((res) => res.value.data);

      if (initialData.length === 0) {
        return;
      }

      const updateData = ids.reduce((acc, id, index) => {
        acc.push({
          id,
          data: {
            aiId: initialData[index].uuid,
            status: Status.generating,
          },
        });
        return acc;
      }, []);

      await this.prisma.$transaction(
        updateData.map((image) =>
          this.prisma.image.update({
            where: { id: image.id },
            data: image.data,
          }),
        ),
      );
    } catch (e) {
      console.error('cron generate error', e);
    }
  }

  async initGeneration(prompt: string, style: string) {
    const formData = new FormData();
    formData.append(
      'params',
      JSON.stringify({
        type: 'GENERATE',
        generateParams: {
          query: prompt,
          style,
        },
      }),
      { contentType: 'application/json' },
    );
    formData.append('model_id', '4');
    return axios.post(
      'https://api-key.fusionbrain.ai/key/api/v1/text2image/run',
      formData,
      {
        headers: this.axiosHeaders,
      },
    );
  }
}
