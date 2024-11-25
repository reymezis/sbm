import { IsValidStyle } from './decorators/image.style.decorator';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    description: 'Image description to generate',
    example: 'funny cat',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Image style to generate',
    example: 'DEFAULT',
  })
  @IsString()
  @IsValidStyle()
  style: string;
}
