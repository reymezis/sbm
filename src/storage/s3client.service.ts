import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutBucketPolicyCommand,
  CreateBucketCommand,
  ListBucketsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3clientService {
  private s3: S3Client;
  private readonly bucketName = 'images';
  private readonly s3_endpoint;

  constructor(private readonly configService: ConfigService) {
    this.s3_endpoint = configService.get('MINIO_ENDPOINT');
    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: this.s3_endpoint,
      credentials: {
        accessKeyId: configService.get('MINIO_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('MINIO_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
      tls: false,
    });
  }

  async checkBucketExists() {
    const buckets = await this.s3.send(new ListBucketsCommand());
    return !!buckets.Buckets?.find((bucket) => bucket.Name === this.bucketName);
  }

  async createBucket() {
    await this.s3.send(
      new CreateBucketCommand({
        Bucket: this.bucketName,
      }),
    );

    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/*`,
        },
      ],
    };

    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(bucketPolicy),
      }),
    );
  }

  async uploadImage(file: Buffer, key: string): Promise<string> {
    try {
      if (!(await this.checkBucketExists())) {
        await this.createBucket();
      }

      const fileKey = `${key}.webp`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file,
        ContentType: 'image/webp',
      });
      await this.s3.send(putObjectCommand);

      return `http://localhost:9000/${this.bucketName}/${fileKey}`;
    } catch (e) {
      console.log('uploadFile', e);
    }
  }

  getKey(aiId: string, min = false) {
    const fileExt = '.webp';
    return min ? `${aiId}-128x128${fileExt}` : `${aiId}${fileExt}`;
  }

  async getFile(fileKey: string) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ResponseContentType: 'image/webp',
    });

    const response = await this.s3.send(getObjectCommand);
    return response.Body as Readable;
  }
}
