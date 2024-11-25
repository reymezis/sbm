import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckStatusRdo {
  @ApiPropertyOptional()
  status: string;
}
