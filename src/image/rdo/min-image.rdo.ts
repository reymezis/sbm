import { ApiPropertyOptional } from '@nestjs/swagger';

export class MinImageRdo {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  prompt: string;

  @ApiPropertyOptional()
  style: string;

  @ApiPropertyOptional()
  status: string;

  @ApiPropertyOptional()
  urlSized: string;

  @ApiPropertyOptional()
  createdAt: Date;
}
