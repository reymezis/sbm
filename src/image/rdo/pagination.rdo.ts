import { ApiPropertyOptional } from '@nestjs/swagger';
import { MinImageRdo } from './min-image.rdo';

export class PaginationRdo {
  @ApiPropertyOptional({ type: [MinImageRdo] })
  images: MinImageRdo[];

  @ApiPropertyOptional()
  totalCount: number;
}
