import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './create-image.dto';
import { ImageQuery } from './image.query';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CheckStatusRdo } from './rdo/check-status.rdo';
import { CreateImageRdo } from './rdo/create-image.rdo';
import { PaginationRdo } from './rdo/pagination.rdo';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @ApiOperation({ summary: 'Generate image' })
  @ApiCreatedResponse({
    description: 'Response with image id',
    type: CreateImageRdo,
  })
  @Post()
  create(@Body() { text, style }: CreateImageDto) {
    return this.imageService.generateImage(text, style);
  }

  @ApiOperation({
    summary: 'Get image by id',
    description: 'Get original or min-size image by id',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Image id',
  })
  @ApiQuery({
    name: 'min',
    required: false,
    enum: [0, 1],
    description: 'To get mini image value 1 is required',
  })
  @ApiOkResponse({
    description: 'Image file',
  })
  @Get(':id')
  findById(
    @Param('id') id: string,
    @Query() query: ImageQuery,
    @Res() res: Response,
  ) {
    return this.imageService.findById(id, query, res);
  }

  @ApiOperation({ summary: 'Check image generation status by id' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Image id',
  })
  @ApiCreatedResponse({
    description: 'Response with status information',
    type: CheckStatusRdo,
  })
  @Get(':id/status')
  async checkStatus(@Param('id') id: string) {
    return this.imageService.checkStatus(id);
  }

  @ApiOperation({
    summary: 'Get mini images with pagination',
    description: 'Get original or min-size image by id',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    default: 5,
    description: 'Limit of images for pagination',
  })
  @ApiOkResponse({
    description: 'List of mini images',
    type: PaginationRdo,
  })
  @Get()
  find(@Query() query: ImageQuery) {
    return this.imageService.find(query);
  }
}
