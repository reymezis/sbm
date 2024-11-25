import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImageRdo {
  @ApiPropertyOptional()
  id: string;
}
