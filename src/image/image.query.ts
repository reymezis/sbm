import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ImageQuery {
  @IsOptional()
  @Transform(({ value }) => !!+value)
  public min = 0;

  @IsOptional()
  @Transform(({ value }) => +value)
  public page = 1;

  @IsOptional()
  @Transform(({ value }) => +value)
  public limit = 5;
}
