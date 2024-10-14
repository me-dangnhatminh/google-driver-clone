import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('folder')
@ApiBearerAuth()
@Controller({ path: 'storage/folder', version: '1' })
export class FolderRestController {
  constructor(@Inject('StorageService') private readonly storageService) {}

  @Get()
  @ApiQuery({
    name: 'filter',
    required: false,
    type: 'object',
    style: 'deepObject',
    explode: false,
    allowReserved: true,
    description: `Filter conditions as an object (e.g., filter[name]=minh&filter[age]=gt:12)`,
    examples: {
      default: { value: {} },
      example_1: { value: { name: 'minh' } },
      example_2: { value: { age: 'gt:12', meta: { key: 'gt:12' } } },
    },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    isArray: true,
    type: String,
    style: 'form',
    explode: false,
    allowReserved: true,
    description: `Sorting conditions (e.g., sort=name:asc,age:desc)`,
    examples: {
      default: { value: [] },
      example_1: { value: ['name:asc'] },
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit for pagination (e.g., limit=10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination (e.g., offset=10)',
  })
  async list(
    @Query('filter') filter?: Record<string, any>,
    @Query('sort') sort?: Record<string, string>,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.storageService
      .listFolder({
        filter,
        sort,
        limit,
        offset,
      })
      .toPromise();
    return result;
  }

  @Get(':id')
  async get(@Query('id') id: string) {
    const result = await this.storageService.getFolder({ id }).toPromise();
    return result;
  }

  @Get(':id/content')
  @ApiQuery({
    name: 'filter',
    required: false,
    type: 'object',
    style: 'deepObject',
    explode: false,
    allowReserved: true,
    description: `Filter conditions as an object (e.g., filter[name]=minh&filter[age]=gt:12)`,
    examples: {
      default: { value: {} },
      example_1: { value: { name: 'minh' } },
      example_2: { value: { age: 'gt:12', meta: { key: 'gt:12' } } },
    },
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    isArray: true,
    type: String,
    style: 'form',
    explode: false,
    allowReserved: true,
    description: `Sorting conditions (e.g., sort=name:asc,age:desc)`,
    examples: {
      default: { value: [] },
      example_1: { value: ['name:asc'] },
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit for pagination (e.g., limit=10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination (e.g., offset=10)',
  })
  async getContent(
    @Param('id') id: string,
    @Query('filter') filter?: Record<string, any>,
    @Query('sort') sort?: Record<string, string>,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.storageService
      .getFolderContent({
        id,
        filter,
        sort,
        limit,
        offset,
      })
      .toPromise();
    return result;
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ownerId: { type: 'string' },
        parentId: { type: 'string' },
      },
      required: ['name'],
    },
  })
  async create(@Body() body) {
    const result = await this.storageService.createFolder(body).toPromise();
    return result;
  }

  @Post(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        ownerId: { type: 'string' },
        parentId: { type: 'string' },
      },
    },
  })
  async update(@Param('id') id: string, @Body() body) {
    const result = await this.storageService
      .updateFolder({ id, ...body })
      .toPromise();
    return result;
  }
}
// @Get(':id/children')
// async getChildren(@Query('id') id: string) {
//   return { id };
// }

// @Get(':id/parents')
// async getParents(@Query('id') id: string) {
//   return { id };
// }

// @Get(':id/ancestors')
// async getAncestors(@Query('id') id: string) {
//   return { id };
// }

// @Get(':id/descendants')
// async getDescendants(@Query('id') id: string) {
//   return { id };
// }
