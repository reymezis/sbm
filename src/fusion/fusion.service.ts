import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class FusionService {
  async convertImage(base64Image: string) {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    return await sharp(imageBuffer).webp().toBuffer();
  }

  async resizeImage(buffer: Buffer) {
    const sizePx = 128;
    return await sharp(buffer).resize(sizePx, sizePx).webp().toBuffer();
  }
}
